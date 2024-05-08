use std::cell::RefCell;

use candid::{CandidType, Deserialize, Nat, Principal};

type Blob = Vec<u8>;

/// Auction item. Exported as Candid type.
#[derive(CandidType, Deserialize, Clone)]
struct Item {
    /// Auction title
    title: String,
    /// Auction description
    description: String,
    /// Image binary data, currently only PNG supported.
    image: Blob,
}

/// Auction bid. Exported as Candid type.
#[derive(CandidType, Deserialize, Clone)]
struct Bid {
    /// Price in the unit of the currency (ICP).
    price: Nat,
    /// Point in time of the bid, measured as the
    /// remaining until the closing of the auction.
    time: Nat,
    /// Authenticated user id of this bid.
    originator: Principal,
}

/// Auction identifier that is generated and associated
/// by the actor to later retrieve an auction.
/// Shared type.
type AuctionId = Nat;

/// Reduced information of an auction. Exported as Candid type.
#[derive(CandidType, Deserialize, Clone)]
struct AuctionOverview {
    /// Id associated to the auction serving for retrieval.
    id: AuctionId,
    /// Item sold in the auction.
    item: Item,
}

/// Detailed information of an auction. Exported as Candid type.
#[derive(CandidType, Deserialize, Clone)]
#[allow(non_snake_case)]
struct AuctionDetails {
    /// Item sold in the auction.
    item: Item,
    /// Series of valid bids in this auction, sorted by price.
    bidHistory: Vec<Bid>,
    /// Remaining time until the end of the auction.
    /// `0` means that the auction is closed.
    /// The last entry in `bidHistory`, if existing, denotes
    /// the auction winner.
    remainingTime: Nat,
}

/// Internal type, combining all information about an auction.
struct Auction {
    id: AuctionId,
    details: AuctionDetails,
}

/// Install a recurring timer to close expired auctions.
#[ic_cdk::init]
fn init() {
    // TODO: Implementation
}

/// The timer needs to be reinstalled on canister upgrade.
#[ic_cdk::post_upgrade]
fn post_upgrade() {
    init();
}

/// Register a new auction that is open for the defined duration.
#[ic_cdk::update]
#[allow(non_snake_case)]
fn newAuction(item: Item, duration: Nat) {
    // TODO: Implementation
    ic_cdk::trap("not yet implemented");
}

/// Retrieve all auctions (open and closed) with their ids and reduced overview information.
/// Specific auctions can be separately retrieved by `getAuctionDetail`.
#[ic_cdk::update]
#[allow(non_snake_case)]
fn getOverviewList() -> Vec<AuctionOverview> {
    // TODO: Implementation
    ic_cdk::trap("not yet implemented");
}

/// Retrieve the detail information of auction by its id.
/// The returned detail contain status about whether the auction is active or closed,
/// and the bids make so far.
#[ic_cdk::update]
#[allow(non_snake_case)]
fn getAuctionDetails(auction_id: AuctionId) -> AuctionDetails {
    // TODO: Implementation
    ic_cdk::trap("not yet implemented");
}

/// Make a new bid for a specific auction specified by the id.
/// Checks that:
/// * The user (`ic_cdk::caller()`) is authenticated.
/// * The price is valid, higher than the last bid, if existing.
/// * The auction is still open (not finished).
/// If valid, the bid is appended to the bid history.
/// Otherwise, traps with an error.
#[ic_cdk::update]
#[allow(non_snake_case)]
fn makeBid(auction_id: AuctionId, price: Nat) {
    // TODO: Implementation
    ic_cdk::trap("not yet implemented");
}
