import { ic, Canister, Record, Variant, Vec, Void, Principal, query, update, text, blob, nat } from 'azle';

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
   bidHistory: Vec(Bid), //AuctionId,
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

/*
async function tick(): Promise<void> {
    for (let auction of auctions) {
        if (auction.remainingTime > 0) {
            auction.remainingTime -= 1;
        }
    }
}

let _timer = Timer.recurringTimer({ seconds: 1 }, tick);
*/
type AuctionId = bigint;

function newAuctionId(): AuctionId {
    let id = idCounter;
    idCounter += 1n;
    return id;
}

function findAuction(auctionId: AuctionId): Auction {
    let result = auctions.find(auction => auction.id === auctionId);
    if (!result) {
        ic.trap("Inexistent id");
    }
    return result!;
}

function minimumPrice(auction: Auction): bigint {
    let lastBid = auction.bidHistory[0];
    return lastBid ? lastBid.price + 1n : 1n;
}


export default Canister({

    // Retrieve the detail information of auction by its id.
    // The returned detail contain status about whether the auction is active or closed,
    // and the bids make so far.
    getAuctionDetails: update([nat], AuctionDetails, (auctionId) => {
      let result = auctions.find(auction => auction.id === auctionId);
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
      let overviewList = auctions.map(getOverview);
      return overviewList.reverse();
    }),

    // Make a new bid for a specific auction specified by the id.
    // Checks that:
    // * The user (`message.caller`) is authenticated.
    // * The price is valid, higher than the last bid, if existing.
    // * The auction is still open (not finished).
    // If valid, the bid is appended to the bid history.
    // Otherwise, traps with an error.
    makeBid: update([nat/*AuctionId*/, nat], Void, (auctionId, price) => {
      let originator = ic.caller();
      if (originator.isAnonymous()) {
        ic.trap("Anonymous caller");
      }
      let auction = findAuction(auctionId);
      if (price < minimumPrice(auction)) {
        ic.trap("Price too low");
      }
      let time = auction.remainingTime;
      if (time === 0n) {
        ic.trap("Auction closed");
      }
      let newBid: Bid = { price, time, originator };
      auction.bidHistory.unshift(newBid);
    }),

    // Register a new auction that is open for the defined duration.
    newAuction: update([Item, nat], Void, (item, duration) => {
     let id = newAuctionId();
     let bidHistory: Bid[] = [];
     let newAuction: Auction = { id, item, bidHistory, remainingTime: duration };
     auctions.unshift(newAuction);
    })
})
