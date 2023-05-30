import Principal "mo:base/Principal";
import Timer "mo:base/Timer";
import Debug "mo:base/Debug";
import List "mo:base/List";

/// Backend server actor for the auction platform
actor {
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
    /// Price in the unit of the currency (e.g. ICP).
    price : Nat;
    /// Point in time of the bid, measured as the
    /// remaining until the closing of the auction.
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

  /// Bid infomation of auction. Shared type.
  type AuctionStatus = {
    /// Series of valid bids in this auction, sorted by price.
    bidHistory : [Bid];
    /// Remaining time until the end of the auction.
    /// `0` means that the auction is closed.
    /// The last entry in `bidHistory`, if existing, denotes
    /// the auction winner.
    remainingTime : Nat;
  };

  /// Detailed information of an auction. Shared type.
  type AuctionDetails = {
    /// Item sold in the auction.
    item : Item;
    /// Series of valid bids in this auction, sorted by price.
    bidHistory : [Bid];
    /// Remaining time until the end of the auction.
    /// `0` means that the auction is closed.
    /// The last entry in `bidHistory`, if existing, denotes
    /// the auction winner.
    remainingTime : Nat;
  };

  /// Internal, non-shared but stable type, storing all information
  /// about an auction. Using a separate type than `AuctionDetail`
  /// to enable simpler and faster extension of the bid history
  /// by means of a `List`.
  type Auction = {
    id : AuctionId;
    item : Item;
    var bidHistory : List.List<Bid>;
    var remainingTime : Nat;
  };

  /// Stable list of all auctions.
  stable var auctions = List.nil<Auction>();
  /// Counter for generating new auction ids.
  stable var idCounter = 0;

  /// Timer event occurring every second, decreasing the remaining
  /// time of each active (unfinished) auction.
  func tick() : async () {
    for (auction in List.toIter(auctions)) {
      if (auction.remainingTime > 0) {
        auction.remainingTime -= 1;
      };
    };
  };

  /// Installing a timer (non-stable), will be reinstalled on canister upgrade.
  let timer = Timer.recurringTimer(#seconds 1, tick);

  /// Internal function for generating a new auction id by using the `idCounter`.
  func newAuctionId() : AuctionId {
    let id = idCounter;
    idCounter += 1;
    id;
  };

  /// Register a new auction that is open for the defined duration.
  public func newAuction(item : Item, duration : Nat) : async () {
    let id = newAuctionId();
    let bidHistory = List.nil<Bid>();
    let newAuction = { id; item; var bidHistory; var remainingTime = duration };
    auctions := List.push(newAuction, auctions);
  };

  /// Retrieve all auctions (open and closed) with their ids and reduced overview information.
  /// Specific auctions can be separatedly retrieved by `getAuctionDetail`.
  public func getOverviewList() : async [AuctionOverview] {
    func getOverview(auction : Auction) : AuctionOverview = {
      id = auction.id;
      item = auction.item;
    };
    let overviewList = List.map<Auction, AuctionOverview>(auctions, getOverview);
    List.toArray(List.reverse(overviewList));
  };

  /// Internal helper function for retrieving an auction by its id.
  /// Traps if the id is inexistent.
  func findAuction(auctionId : AuctionId) : Auction {
    let result = List.find<Auction>(auctions, func auction = auction.id == auctionId);
    switch (result) {
      case null Debug.trap("Inexistent id");
      case (?auction) auction;
    };
  };

  /// Retrieve the detail information of auction by its id.
  /// The returned detail contain status about whether the auction is active or closed,
  /// and the bids make so far.
  public func getAuctionDetails(auctionId : AuctionId) : async AuctionDetails {
    let auction = findAuction(auctionId);
    let bidHistory = List.toArray(List.reverse(auction.bidHistory));
    { item = auction.item; bidHistory; remainingTime = auction.remainingTime };
  };

  /// Internal helper function to retrieve the mininum price for the next bid in an auction.
  /// The minimum price is one unit of the currency larger than the last bid.
  func minimumPrice(auction : Auction) : Nat {
    switch (List.last(auction.bidHistory)) {
      case null 1;
      case (?lastBid) lastBid.price + 1;
    };
  };

  /// Make a new bid for a specific auction specified by the id.
  /// Checks that:
  /// * The user (`message.caller`) is authenticated.
  /// * The price is valid, higher than the last bid, if existing.
  /// * The auction is still open (not finished).
  /// If valid, the bid is appended to the bid history.
  /// Otherwise, traps with an error.
  public shared (message) func makeBid(auctionId : Nat, price : Nat) : async () {
    let originator = message.caller;
    if (Principal.isAnonymous(originator)) {
      Debug.trap("Anonymous caller");
    };
    let auction = findAuction(auctionId);
    if (price < minimumPrice(auction)) {
      Debug.trap("Price too low");
    };
    let time = auction.remainingTime;
    if (time == 0) {
      Debug.trap("Auction closed");
    };
    let newBid = { price; time; originator };
    auction.bidHistory := List.push(newBid, auction.bidHistory);
  };
};
