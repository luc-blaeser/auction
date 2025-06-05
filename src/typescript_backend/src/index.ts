// NOTE: Canister upgrades are not supported in this solution.
// This would require the use of stable data structures, see the Azle documentation.
// Moreover, the auction timer would need to be re-installed after an upgrade.

import { msgCaller, trap, IDL, call, update, Principal, time as icpTime } from 'azle';

export type AuctionId = bigint;

export interface Item {
  description: string,
  image: Uint8Array,
  title: string
};

export const idlItem = IDL.Record({
  description: IDL.Text,
  image: IDL.Vec(IDL.Nat8),
  title: IDL.Text,
});

export interface Bid {
  originator: Principal,
  price: bigint,
  time: bigint,
};

export const idlBid = IDL.Record({
  originator: IDL.Principal,
  price: IDL.Nat,
  time: IDL.Nat
});

export interface AuctionOverview {
  id: bigint,
  item: Item,
}

export const idlAuctionOverview = IDL.Record({
  id: IDL.Nat,
  item: idlItem,
});

export interface AuctionDetails {
  bidHistory: Bid[],
  item: Item,
  remainingTime: bigint,
}

export const idlAuctionDetails = IDL.Record({
  bidHistory: IDL.Vec(idlBid),
  item: idlItem,
  remainingTime: IDL.Nat,
});

export interface Auction {
  id: AuctionId;
  item: Item;
  bidHistory: Bid[];
  closingTime: bigint;
}

let auctions: Auction[] = [];

const MANAGEMENT_CANISTER_ID = 'aaaaa-aa';
    
async function newAuctionId(): Promise<AuctionId> {
  // Can be optimized by caching unused bytes of random blob between `newAuctionId` 
  // calls and re-fetching blob when all bytes have been consumed.
  const blob = await call<undefined, Uint8Array>(MANAGEMENT_CANISTER_ID, 'raw_rand', {
    returnIdlType: IDL.Vec(IDL.Nat8)
  });
  const view = new DataView(blob.buffer);
  return view.getBigUint64(0, false);
}

function findAuction(auctionId: AuctionId): Auction {
  const result = auctions.find(auction => auction.id === auctionId);
  if (!result) {
    trap("Inexistent id");
  }
  return result!;
}

function minimumPrice(auction: Auction): bigint {
  const lastBid = auction.bidHistory[0];
  return lastBid ? lastBid.price + 1n : 1n;
}

const NANO_SECONFS_PER_SECOND = 1_000_000_000n;

export default class {
  // Retrieve the detail information of auction by its id.
  // The returned detail contain status about whether the auction is active or closed,
  // and the bids made so far.
  @update([IDL.Nat], idlAuctionDetails)
  getAuctionDetails(auctionId: bigint): AuctionDetails {
    const result = auctions.find(auction => auction.id === auctionId);
    if (!result) {
      trap("Inexistent id");
    }
    const currentTime = icpTime();
    let timeDifference = result.closingTime - currentTime;
    if (timeDifference < 0) {
      timeDifference = 0n;
    }
    const remainingTime = timeDifference / NANO_SECONFS_PER_SECOND;
    return {
      item: result.item,
      bidHistory: result.bidHistory,
      remainingTime
    };
  }

  // Retrieve all auctions (open and closed) with their ids and reduced overview information.
  // Specific auctions can be separately retrieved by `getAuctionDetail`.
  @update([], IDL.Vec(idlAuctionOverview))
  getOverviewList(): AuctionOverview[] {
    function getOverview(auction: Auction): AuctionOverview {
      return { id: auction.id, item: auction.item };
    }
    const overviewList = auctions.map(getOverview);
    return overviewList.reverse();
  }

  // Make a new bid for a specific auction specified by the id.
  // Checks that:
  // * The user (`ic.caller()`) is authenticated.
  // * The price is valid, higher than the last bid, if existing.
  // * The auction is still open (not finished).
  // If valid, the bid is appended to the bid history.
  // Otherwise, traps with an error.
  @update([IDL.Nat, IDL.Nat])
  makeBid(auctionId: bigint, price: bigint): void {
    const originator = msgCaller();
    if (originator.isAnonymous()) {
      trap("Anonymous caller");
    }
    const auction = findAuction(auctionId);
    if (price < minimumPrice(auction)) {
      trap("Price too low");
    }
    const currentTime = icpTime();
    if (currentTime >= auction.closingTime) {
      trap("Auction closed");
    }
    const time = (auction.closingTime - currentTime) / NANO_SECONFS_PER_SECOND;
    const newBid = { price, time, originator };
    auction.bidHistory.push(newBid);
  }

  // Register a new auction that is open for the defined duration.
  @update([idlItem, IDL.Nat])
  async newAuction(item: Item, duration: bigint): Promise<void> {
    const id = await newAuctionId();
    const bidHistory: Bid[] = [];
    const startTime = icpTime();
    const closingTime = startTime + duration * NANO_SECONFS_PER_SECOND;
    const newAuction = { id, item, bidHistory, closingTime };
    auctions.unshift(newAuction);
  }
}
