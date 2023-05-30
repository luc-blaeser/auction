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
    /// Price in the unit of the currency (ICP).
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

  /// Register a new auction that is open for the defined duration.
  public func newAuction(item : Item, duration : Nat) : async () {
    // TODO: Implementation
    Debug.trap("not yet implemented");
  };

  /// Retrieve all auctions (open and closed) with their ids and reduced overview information.
  /// Specific auctions can be separately retrieved by `getAuctionDetail`.
  public func getOverviewList() : async [AuctionOverview] {
    // TODO: Implementation
    [];
  };

  /// Retrieve the detail information of auction by its id.
  /// The returned detail contain status about whether the auction is active or closed,
  /// and the bids make so far.
  public func getAuctionDetails(auctionId : AuctionId) : async AuctionDetails {
    // TODO: Implementation
    Debug.trap("not yet implemented");
  };

  /// Make a new bid for a specific auction specified by the id.
  /// Checks that:
  /// * The user (`message.caller`) is authenticated.
  /// * The price is valid, higher than the last bid, if existing.
  /// * The auction is still open (not finished).
  /// If valid, the bid is appended to the bid history.
  /// Otherwise, traps with an error.
  public shared (message) func makeBid(auctionId : AuctionId, price : Nat) : async () {
    // TODO: Implementation
    Debug.trap("not yet implemented");
  };
};
