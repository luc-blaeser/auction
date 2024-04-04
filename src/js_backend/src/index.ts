import { Canister, Record, Variant, Vec, Void, Principal, query, update, text, blob, nat } from 'azle';

export const Item = Record({
    description: text,
    image: blob,
    title: text
   });

export type Item = typeof Item.tsType;

export const Bid = Record({
    orginator: Principal,
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
   bidHistory: nat, //AuctionId,
   item: Item,
   remainingTime: nat
 });

export type AuctionDetails = typeof AuctionDetails.tsType;

export default Canister({

    // Retrieve the detail information of auction by its id.
    // The returned detail contain status about whether the auction is active or closed,
    // and the bids make so far.
    getAuctionDetails: update([nat], AuctionDetails, (auctionId) => {
        ic.reject("getAuctionDetails");
    }),

    // Retrieve all auctions (open and closed) with their ids and reduced overview information.
    // Specific auctions can be separately retrieved by `getAuctionDetail`.
    getOverviewList: update([nat], Vec(AuctionOverview), (auctionId) => {
        ic.reject("getAuctionOverview");
    }),

    // Make a new bid for a specific auction specified by the id.
    // Checks that:
    // * The user (`message.caller`) is authenticated.
    // * The price is valid, higher than the last bid, if existing.
    // * The auction is still open (not finished).
    // If valid, the bid is appended to the bid history.
    // Otherwise, traps with an error.
    makeBid: update([nat/*AuctionId*/, nat], Void, (auctionId, n) => {
        ic.reject("makeBid");
    }),

    // Register a new auction that is open for the defined duration.
    newAuction: update([Item, nat], Void, (item, n) => {
        ic.reject("makeBid");
    })
})
