import Prim "mo:prim";
import Buffer "mo:base/Buffer";
import Principal "mo:base/Principal";
import Error "mo:base/Error";

actor {
  // TODO: Make stable

  type Item = {
    title : Text;
    description : Text;
    image : Blob;
  };

  type Bid = {
    price : Nat;
    originator : Principal.Principal;
  };

  type Auction = {
    item: Item;
    bidHistory: Buffer.Buffer<Bid>;
  };

  let auctions = Buffer.Buffer<Auction>(0);

  public func newAuction(item : Item) : async () {
    let bidHistory = Buffer.Buffer<Bid>(0);
    let newAuction = { item; bidHistory };
    auctions.add(newAuction);
  };

  public func getItems() : async [Item] {
    Buffer.toArray(Buffer.map<Auction, Item>(auctions, func auction = auction.item));
  };

  public func getBidHistory(auctionId: Nat) : async [Bid] {
    Buffer.toArray(auctions.get(auctionId).bidHistory);
  };

  func lastBid(auction: Auction) : ?Bid {
    let history = auction.bidHistory;
    if (history.size() > 0) {
      ?history.get(history.size() - 1);
    } else {
      null;
    };
  };

  func isHigher(auction: Auction, newPrice : Nat) : Bool {
    switch (lastBid(auction)) {
      case null true;
      case (?oldBid) newPrice > oldBid.price;
    };
  };

  public shared (message) func makeBid(auctionId: Nat, price : Nat) {
    let auction = auctions.get(auctionId);
    if (not isHigher(auction, price)) {
      Prim.trap("Price too low");
    };
    let newBid = { price; originator = message.caller };
    auction.bidHistory.add(newBid);
  };
};
