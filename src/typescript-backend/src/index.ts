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

type AuctionId = bigint;

export default Canister({
    /// Install a recurring timer on initialization, closing the expired auctions.
    init: init([], () => {
        // TODO: Implementation
    }),

    // Re-install the auction timer on upgrade.
    postUpgrade: postUpgrade([], () => {
        // TODO: Implementation
    }),

    // Retrieve the detail information of auction by its id.
    // The returned detail contain status about whether the auction is active or closed,
    // and the bids made so far.
    getAuctionDetails: update([nat], AuctionDetails, (auctionId) => {
        // TODO: Implementation
        ic.trap("not yet implemented");
    }),

    // Retrieve all auctions (open and closed) with their ids and reduced overview information.
    // Specific auctions can be separately retrieved by `getAuctionDetail`.
    getOverviewList: update([], Vec(AuctionOverview), () => {
        // TODO: Implementation
        ic.trap("not yet implemented");
    }),

    // Make a new bid for a specific auction specified by the id.
    // Checks that:
    // * The user (`ic.caller()`) is authenticated.
    // * The price is valid, higher than the last bid, if existing.
    // * The auction is still open (not finished).
    // If valid, the bid is appended to the bid history.
    // Otherwise, traps with an error.
    makeBid: update([nat/*AuctionId*/, nat], Void, (auctionId, price) => {
        // TODO: Implementation
        ic.trap("not yet implemented");
    }),

    // Register a new auction that is open for the defined duration.
    newAuction: update([Item, nat], Void, (item, duration) => {
        // TODO: Implementation
        ic.trap("not yet implemented");
    })
})
