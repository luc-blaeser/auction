// NOTE: Canister upgrades are not supported in this solution.
// This would require the use of stable data structures, see the Azle documentation.
// Moreover, the auction timer would need to be re-installed after an upgrade.

import { ic, init, Canister, Record, Vec, Void, Principal, update, text, blob, nat } from 'azle';

export const Item = Record({
  description: text,
  image: blob,
  title: text
});

export type Item = typeof Item.tsType;

export const Bid = Record({
  originator: Principal,
  price: nat,
  time: nat
});

export type Bid = typeof Bid.tsType;

export const AuctionOverview = Record({
  id: nat, //AuctionId,
  item: Item
});

export type AuctionOverview = typeof AuctionOverview.tsType;

export const AuctionDetails = Record({
  bidHistory: Vec(Bid),
  item: Item,
  remainingTime: nat
});

export type AuctionDetails = typeof AuctionDetails.tsType;

interface Auction {
  id: AuctionId;
  item: Item;
  bidHistory: Bid[];
  remainingTime: bigint;
}

let auctions: Auction[] = [];
let idCounter: bigint = 0n;

function tick() {
  for (let auction of auctions) {
    if (auction.remainingTime > 0n) {
      auction.remainingTime -= 1n;
    }
  }
}

type AuctionId = bigint;

function newAuctionId(): AuctionId {
  const id = idCounter;
  idCounter += 1n;
  return id;
}

function findAuction(auctionId: AuctionId): Auction {
  const result = auctions.find(auction => auction.id === auctionId);
  if (!result) {
    ic.trap("Inexistent id");
  }
  return result!;
}

function minimumPrice(auction: Auction): bigint {
  const lastBid = auction.bidHistory[0];
  return lastBid ? lastBid.price + 1n : 1n;
}

function installTimer() {
    const _timer = ic.setTimerInterval(1n, tick);
}

export default Canister({
  /// Install the auction timer on initialization.
  init: init([], () => {
    installTimer();
  }),

  // Re-install the auction timer on upgrade.
  // NOTE: The state is not yet preserved across upgrades. See comment above.
  postUpgrade: postUpgrade([], () => {
    installTimer();
  }),

  // Retrieve the detail information of auction by its id.
  // The returned detail contain status about whether the auction is active or closed,
  // and the bids made so far.
  getAuctionDetails: update([nat], AuctionDetails, (auctionId) => {
    const result = auctions.find(auction => auction.id === auctionId);
    if (!result) {
      ic.trap("Inexistent id");
    }
    return result!;
  }),

  // Retrieve all auctions (open and closed) with their ids and reduced overview information.
  // Specific auctions can be separately retrieved by `getAuctionDetail`.
  getOverviewList: update([], Vec(AuctionOverview), () => {
    function getOverview(auction: Auction): AuctionOverview {
      return { id: auction.id, item: auction.item };
    }
    const overviewList = auctions.map(getOverview);
    return overviewList.reverse();
  }),

  // Make a new bid for a specific auction specified by the id.
  // Checks that:
  // * The user (`ic.caller()`) is authenticated.
  // * The price is valid, higher than the last bid, if existing.
  // * The auction is still open (not finished).
  // If valid, the bid is appended to the bid history.
  // Otherwise, traps with an error.
  makeBid: update([nat/*AuctionId*/, nat], Void, (auctionId, price) => {
    const originator = ic.caller();
    if (originator.isAnonymous()) {
      ic.trap("Anonymous caller");
    }
    const auction = findAuction(auctionId);
    if (price < minimumPrice(auction)) {
      ic.trap("Price too low");
    }
    const time = auction.remainingTime;
    if (time === 0n) {
      ic.trap("Auction closed");
    }
    const newBid: Bid = { price, time, originator };
    auction.bidHistory.push(newBid);
  }),

  // Register a new auction that is open for the defined duration.
  newAuction: update([Item, nat], Void, (item, duration) => {
    const id = newAuctionId();
    const bidHistory: Bid[] = [];
    const newAuction: Auction = { id, item, bidHistory, remainingTime: duration };
    auctions.unshift(newAuction);
  })
})
