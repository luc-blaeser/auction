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
let idCounter = 0n;

const MANAGEMENT_CANISTER_ID = 'aaaaa-aa';
    
async function newAuctionId(): Promise<AuctionId> {
  return idCounter++;
}

function findAuction(auctionId: AuctionId): Auction {
  const result = auctions.find(auction => auction.id === auctionId);
  if (!result) {
    trap("Inexistent id");
  }
  return result!;
}

const NANO_SECONFS_PER_SECOND = 1_000_000_000n;

export default class {
  // Retrieve the detail information of auction by its id.
  // The returned detail contain status about whether the auction is active or closed,
  // and the bids made so far.
  @update([IDL.Nat], idlAuctionDetails)
  getAuctionDetails(auctionId: bigint): AuctionDetails {
    // TODO: Implement
    throw new Error('not yet implemented');
  }

  // Retrieve all auctions (open and closed) with their ids and reduced overview information.
  // Specific auctions can be separately retrieved by `getAuctionDetail`.
  @update([], IDL.Vec(idlAuctionOverview))
  getOverviewList(): AuctionOverview[] {
    // TODO: Implement
    throw new Error('not yet implemented');
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
    // TODO: Implement
    throw new Error('not yet implemented');
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
