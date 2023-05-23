import Prim "mo:prim";
import Buffer "mo:base/Buffer";
import Principal "mo:base/Principal";
import Error "mo:base/Error";
import Bool "mo:base/Bool";

actor {
  // TODO: Make stable

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

  type Auction = {
    item : Item;
    bidHistory : Buffer.Buffer<Bid>;
    var remainingTime : Nat;
  };

  let auctions = Buffer.Buffer<Auction>(0);

  func tick() : async () {
    for (auction in auctions.vals()) {
      if (auction.remainingTime > 0) {
        auction.remainingTime -= 1;
      };
    };
  };

  let second : Nat64 = 1_000_000_000;
  let timer = Prim.setTimer(second, true, tick);

  public func newAuction(item : Item, duration: Nat) : async () {
    let bidHistory = Buffer.Buffer<Bid>(0);
    let newAuction = { item; bidHistory; var remainingTime = duration };
    auctions.add(newAuction);
  };

  public func getItems() : async [Item] {
    Buffer.toArray(Buffer.map<Auction, Item>(auctions, func auction = auction.item));
  };

  public func getBidHistory(auctionId : Nat) : async [Bid] {
    Buffer.toArray(auctions.get(auctionId).bidHistory);
  };

  public func getRemainingTime(auctionId : Nat) : async Nat {
    auctions.get(auctionId).remainingTime;
  };

  func lastBid(auction : Auction) : ?Bid {
    let history = auction.bidHistory;
    if (history.size() > 0) {
      ?history.get(history.size() - 1);
    } else {
      null;
    };
  };

  func isHigher(auction : Auction, newPrice : Nat) : Bool {
    switch (lastBid(auction)) {
      case null true;
      case (?oldBid) newPrice > oldBid.price;
    };
  };

  public shared (message) func makeBid(auctionId : Nat, price : Nat) {
    let originator = message.caller;
    let auction = auctions.get(auctionId);
    if (not isHigher(auction, price)) {
      Prim.trap("Price too low");
    };
    let time = auction.remainingTime;
    if (auction.remainingTime == 0) {
      Prim.trap("Auction closed");
    };
    let newBid = { price; time; originator };
    auction.bidHistory.add(newBid);
  };
};
