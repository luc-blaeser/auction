import Principal "mo:base/Principal";
import Map "mo:base/Map";
import Iter "mo:base/Iter";
import List "mo:base/List";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Int "mo:base/Int";
import Time "mo:base/Time";
import Runtime "mo:base/Runtime";
import Random "mo:base/Random";

/// Backend server actor for the auction platform
persistent actor {
  /// Auction item. Shared type.
  type Item = {
    /// Auction title
    title : Text;
    /// Auction description
    description : Text;
    /// Image binary data, currently only PNG supported.
    image : Blob;
  };

  /// Auction bid. Shared type.
  type Bid = {
    /// Price in the unit of the currency (ICP).
    price : Nat;
    /// Point in time of the bid, measured as the
    /// remaining seconds until the closing of the auction.
    time : Nat;
    /// Authenticated user id of this bid.
    originator : Principal.Principal;
  };

  /// Auction identifier that is generated and associated
  /// by the actor to later retrieve an auction.
  /// Shared type.
  type AuctionId = Nat;

  /// Reduced information of an auction. Shared type.
  type AuctionOverview = {
    /// Id associated to the auction serving for retrieval.
    id : AuctionId;
    /// Item sold in the auction.
    item : Item;
  };

  /// Detailed information of an auction. Shared type.
  type AuctionDetails = {
    /// Item sold in the auction.
    item : Item;
    /// Series of valid bids in this auction, sorted by price.
    bidHistory : [Bid];
    /// Remaining duration in seconds until the end of the auction.
    /// `0` means that the auction is closed.
    /// The last entry in `bidHistory`, if existing, denotes
    /// the auction winner.
    remainingTime : Nat;
  };

  /// Internal, non-shared type, storing all information
  /// about an auction. Using a separate type than `AuctionDetails`
  /// to enable simpler and faster extension of the bid history
  /// by means of a `List`.
  type Auction = {
    id : AuctionId;
    item : Item;
    bidHistory : List.List<Bid>;
    closingTime : Time.Time;
  };

  /// Map auction id to auctions.
  let auctions = Map.empty<AuctionId, Auction>();
  /// Secure random number generator for auction id generation.
  transient let random = Random.crypto();

  /// Internal function for generating a new auction id by using the `idCounter`.
  func newAuctionId() : async* AuctionId {
    Nat64.toNat(await* random.nat64());
  };

  /// Register a new auction that is open for the defined duration in seconds.
  public func newAuction(item : Item, duration : Nat) : async () {
    let id = await* newAuctionId();
    let bidHistory = List.empty<Bid>();
    let startTime = Time.now();
    let closingTime = startTime + Time.toNanoseconds(#seconds(duration));
    let newAuction = { id; item; bidHistory; closingTime };
    Map.add(auctions, Nat.compare, id, newAuction);
  };

  /// Retrieve all auctions (open and closed) with their ids and reduced overview information.
  /// Specific auctions can be separately retrieved by `getAuctionDetail`.
  public func getOverviewList() : async [AuctionOverview] {
    func getOverview(auction : Auction) : AuctionOverview = {
      id = auction.id;
      item = auction.item;
    };
    let overviewList = Iter.map(Map.values(auctions), getOverview);
    Iter.toArray(overviewList);
  };

  /// Internal helper function for retrieving an auction by its id.
  /// Traps if the id is inexistent.
  func findAuction(auctionId : AuctionId) : Auction {
    let result = Map.get(auctions, Nat.compare, auctionId);
    switch (result) {
      case null Runtime.trap("Inexistent id");
      case (?auction) auction;
    };
  };

  /// Internal helper to convert ICP time to seconds.
  func timeInSeconds(difference: Time.Time) : Nat {
    let nanosecondsPerSecond = 1_000_000_000;
    Int.toNat(difference) / nanosecondsPerSecond;
  };
  
  /// Retrieve the detail information of auction by its id.
  /// The returned detail contain status about whether the auction is active or closed,
  /// and the bids make so far.
  public func getAuctionDetails(auctionId : AuctionId) : async AuctionDetails {
    let auction = findAuction(auctionId);
    let bidHistory = List.toArray(auction.bidHistory);
    let currentTime = Time.now();
    let timeDifference = auction.closingTime - currentTime;
    let remainingTime = timeInSeconds(Int.max(0, timeDifference));
    { item = auction.item; bidHistory; remainingTime };
  };

  /// Internal helper function to retrieve the minimum price for the next bid in an auction.
  /// The minimum price is one unit of the currency larger than the last bid.
  func minimumPrice(auction : Auction) : Nat {
    let size = List.size(auction.bidHistory);
    if (size == 0) {
      1;
    } else {
      let lastBid = List.get(auction.bidHistory, size - 1 : Nat);
      lastBid.price + 1;
    };
  };

  /// Make a new bid for a specific auction specified by the id.
  /// Checks that:
  /// * The user (`message.caller`) is authenticated.
  /// * The price is valid, higher than the last bid, if existing.
  /// * The auction is still open (not finished).
  /// If valid, the bid is appended to the bid history.
  /// Otherwise, traps with an error.
  public shared (message) func makeBid(auctionId : AuctionId, price : Nat) : async () {
    let originator = message.caller;
    if (Principal.isAnonymous(originator)) {
      Runtime.trap("Anonymous caller");
    };
    let auction = findAuction(auctionId);
    if (price < minimumPrice(auction)) {
      Runtime.trap("Price too low");
    };
    let currentTime = Time.now();
    if (currentTime >= auction.closingTime) {
      Runtime.trap("Auction closed");
    };
    let time = timeInSeconds(auction.closingTime - currentTime);
    let newBid = { price; time; originator };
    List.add(auction.bidHistory, newBid);
  };
};
