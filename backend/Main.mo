import Principal "mo:base/Principal";
import RBTree "mo:base/RBTree";
import Nat "mo:base/Nat";
import Timer "mo:base/Timer";
import Debug "mo:base/Debug";
import StableList "StableList";

actor {
  type Item = {
    title : Text;
    description : Text;
    image : Blob;
  };

  type Bid = {
    price : Nat;
    time : Nat;
    originator : Principal.Principal;
  };

  type AuctionId = Nat;

  type AuctionOverview = {
    id : AuctionId;
    item : Item;
  };

  type AuctionStatus = {
    bidHistory : [Bid];
    remainingTime : Nat;
  };

  type AuctionDetails = {
    item : Item;
    bidHistory : [Bid];
    remainingTime : Nat;
  };

  type Auction = {
    id: AuctionId;
    item : Item;
    bidHistory : StableList.List<Bid>;
    var remainingTime : Nat;
  };

  stable let auctions = StableList.List<Auction>();
  stable var idCounter = 0;

  func tick() : async () {
    for (auction in StableList.iterate(auctions)) {
      if (auction.remainingTime > 0) {
        auction.remainingTime -= 1;
      };
    };
  };

  let timer = Timer.recurringTimer(#seconds 1, tick);

  func newAuctionId() : AuctionId {
    let id = idCounter;
    idCounter += 1;
    id;
  };

  public func newAuction(item : Item, duration : Nat) : async () {
    let id = newAuctionId();
    let bidHistory = StableList.List<Bid>();
    let newAuction = { id; item; bidHistory; var remainingTime = duration };
    StableList.add(auctions, newAuction);
  };

  public query func getOverviewList() : async [AuctionOverview] {
    func getOverview(auction: Auction): AuctionOverview = { id = auction.id; item = auction.item };
    let overviewList = StableList.map<Auction, AuctionOverview>(auctions, getOverview);
    StableList.toArray(overviewList);
  };

  func findAuction(auctionId : AuctionId) : Auction {
    let result = StableList.find<Auction>(auctions, func auction = auction.id == auctionId);
    switch (result) {
      case null Debug.trap("Inexistent id");
      case (?auction) auction;
    };
  };

  public query func getAuctionDetails(auctionId : AuctionId) : async AuctionDetails {
    let auction = findAuction(auctionId);
    let bidHistory = StableList.toArray(auction.bidHistory);
    { item = auction.item; bidHistory; remainingTime = auction.remainingTime };
  };

  func minimumPrice(auction : Auction) : Nat {
    let history = auction.bidHistory;
    if (StableList.isEmpty(history)) {
      return 1;
    };
    let lastBid = StableList.last(history);
    lastBid.price + 1;
  };

  public shared (message) func makeBid(auctionId : Nat, price : Nat) {
    let originator = message.caller;
    let auction = findAuction(auctionId);
    if (price < minimumPrice(auction)) {
      Debug.trap("Price too low");
    };
    let time = auction.remainingTime;
    if (time == 0) {
      Debug.trap("Auction closed");
    };
    let newBid = { price; time; originator };
    StableList.add(auction.bidHistory, newBid);
  };
};
