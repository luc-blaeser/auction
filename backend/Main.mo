import Prim "mo:prim";
import Buffer "mo:base/Buffer";
import Principal "mo:base/Principal";
import Error "mo:base/Error";

actor {
  type Bid = {
    price: Nat;
    originator: Principal.Principal;
  };

  // TODO: Make stable
  let bidHistory = Buffer.Buffer<Bid>(0);

  func lastBid(): ?Bid {
    if (bidHistory.size() > 0) {
      ?bidHistory.get(bidHistory.size() - 1)
    } else {
      null
    }
  };

  func isHigher(price: Nat): Bool {
    switch (lastBid()) {
      case null true;
      case (?oldBid) price > oldBid.price;
    };
  };

  // Get the current count
  public func getBidHistory() : async [Bid] {
    Buffer.toArray(bidHistory);
  };

  public func currentBid(): async ?Bid {
    lastBid()
  };

  public shared(message) func makeBid(price: Nat) {
    if (not isHigher(price)) {
      Prim.trap("Price too low");
    };
    let newBid = { price; originator = message.caller; };
    bidHistory.add(newBid);
  };
};
