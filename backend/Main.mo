import Prim "mo:prim";
import Principal "mo:base/Principal";
import RBTree "mo:base/RBTree";
import Nat "mo:base/Nat";
import Buffer "mo:base/Buffer";

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
    id: AuctionId;
    item: Item;
  };

  type AuctionStatus = {
    bidHistory : [Bid];
    remainingTime : Nat;
  };

  type Auction = {
    overview: AuctionOverview;
    var status: AuctionStatus;
  };

  stable var auctions: RBTree.Tree<AuctionId, Auction> = #leaf;

  func tick() : async () {
    for ((_, auction) in RBTree.iter(auctions, #fwd)) {
      let oldStatus = auction.status;
      if (oldStatus.remainingTime > 0) {
        let newStatus = { 
          bidHistory = oldStatus.bidHistory; 
          remainingTime = oldStatus.remainingTime - 1 : Nat; 
        };
        auction.status := newStatus;
      };
    };
  };

  let second : Nat64 = 1_000_000_000;
  let timer = Prim.setTimer(second, true, tick);

  var idCounter = 0;

  func newAuctionId(): AuctionId {
    let id = idCounter;
    idCounter += 1;
    id;
  };

  public func newAuction(item : Item, duration: Nat) : async () {
    let id = newAuctionId();
    let overview = { id; item; };
    let bidHistory: [Bid] = [];
    let status = { bidHistory; remainingTime = duration };
    let newAuction = { overview; var status };
    let tree = RBTree.RBTree<AuctionId, Auction>(Nat.compare);
    tree.unshare(auctions);
    tree.put(id, newAuction);
    auctions := tree.share();
  };

  public func getOverviewList() : async [AuctionOverview] {
    let buffer = Buffer.Buffer<AuctionOverview>(0);
    for ((_, auction) in RBTree.iter(auctions, #fwd)) {
      buffer.add(auction.overview);
    };
    Buffer.toArray(buffer);
  };

  func findAuction(auctionId: AuctionId): Auction {
    let tree = RBTree.RBTree<AuctionId, Auction>(Nat.compare);
    tree.unshare(auctions);
    let result = tree.get(auctionId);
    switch (result) {
      case null Prim.trap("Inexistent id");
      case (?auction) auction;
    }
  };

  public func getAuction(auctionId: AuctionId): async AuctionStatus {
    let auction = findAuction(auctionId);
    auction.status;
  };

  func lastBid(auction : Auction) : ?Bid {
    let history = auction.status.bidHistory;
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

  func appendToArray<T>(array: [T], value: T): [T] {
    Prim.Array_tabulate<T>(array.size() + 1, func (index) {
      if (index < array.size()) {
        array[index];
      } else {
        value;
      }
    });
  };

  public shared (message) func makeBid(auctionId : Nat, price : Nat) {
    let originator = message.caller;
    let auction = findAuction(auctionId);
    if (not isHigher(auction, price)) {
      Prim.trap("Price too low");
    };
    let oldStatus = auction.status;
    let time = oldStatus.remainingTime;
    if (time == 0) {
      Prim.trap("Auction closed");
    };
    let newBid = { price; time; originator };
    let newHistory = appendToArray(oldStatus.bidHistory, newBid);
    let newStatus = { bidHistory = newHistory; remainingTime = time };
    auction.status := newStatus;
  };
};
