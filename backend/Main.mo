import Prim "mo:prim";
import Buffer "mo:base/Buffer";
import Principal "mo:base/Principal";
import Error "mo:base/Error";

actor {
  type Auction = {
    title : Text;
    description : Text;
    image : Blob;
  };

  stable var currentAuction : ?Auction = null;

  public func newAuction(auction : Auction) : async () {
    Prim.debugPrint("New auction " # debug_show(auction.image.size()));
    currentAuction := ?auction;
  };

  public func getAuction() : async ?Auction {
    Prim.debugPrint("Get auction " # debug_show(currentAuction != null));
    currentAuction;
  };

  type Bid = {
    price : Nat;
    originator : Principal.Principal;
  };

  // TODO: Make stable
  let bidHistory = Buffer.Buffer<Bid>(0);

  func lastBid() : ?Bid {
    if (bidHistory.size() > 0) {
      ?bidHistory.get(bidHistory.size() - 1);
    } else {
      null;
    };
  };

  func isHigher(price : Nat) : Bool {
    switch (lastBid()) {
      case null true;
      case (?oldBid) price > oldBid.price;
    };
  };

  // Get the current count
  public func getBidHistory() : async [Bid] {
    Buffer.toArray(bidHistory);
  };

  public func currentBid() : async ?Bid {
    lastBid();
  };

  public shared (message) func makeBid(price : Nat) {
    if (not isHigher(price)) {
      Prim.trap("Price too low");
    };
    let newBid = { price; originator = message.caller };
    bidHistory.add(newBid);
  };
};
