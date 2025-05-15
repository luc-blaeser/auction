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
    /// remaining seconds until the closing of the auction.
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
    /// Remaining duration in seconds until the end of the auction.
    /// `0` means that the auction is closed.
    /// The last entry in `bidHistory`, if existing, denotes
    /// the auction winner.
    remainingTime: Nat,
}

/// Internal type, combining all information about an auction.
/// Using a separate type than `AuctionDetails` because of the
/// difference between closing time and remaining time.
struct Auction {
    id: AuctionId,
    item: Item,
    bid_history: Vec<Bid>,
    closing_time: u64,
}

// NOTE: UPGRADES ARE NOT YET SUPPORTED. THIS WOULD NEED STABLE DATA STRUCTURES!

thread_local! {
    /// List of all auctions.
    static AUCTIONS: RefCell<Vec<Auction>> = const { RefCell::new(vec![]) };

    /// Counter for generating new auction ids.
    static ID_COUNTER: RefCell<Nat> = RefCell::new(Nat::from(0usize));
}

/// Internal function for generating a new auction id by using the `idCounter`.
fn new_auction_id() -> AuctionId {
    ID_COUNTER.with(|counter| {
        let result = counter.borrow().clone();
        *counter.borrow_mut() += 1usize;
        result
    })
}

const NANO_SECONDS_PER_SECOND: u64 = 1_000_000_000;

/// Register a new auction that is open for the defined duration.
#[ic_cdk::update]
#[allow(non_snake_case)]
fn newAuction(item: Item, duration: Nat) {
    let id = new_auction_id();
    let start_time = ic_cdk::api::time();
    let closing_time = start_time + u64::try_from(duration.0).unwrap() * NANO_SECONDS_PER_SECOND;
    let new_auction = Auction {
        id,
        item,
        bid_history: vec![],
        closing_time,
    };
    AUCTIONS.with(|auctions| auctions.borrow_mut().push(new_auction));
}

/// Retrieve all auctions (open and closed) with their ids and reduced overview information.
/// Specific auctions can be separately retrieved by `getAuctionDetail`.
#[ic_cdk::update]
#[allow(non_snake_case)]
fn getOverviewList() -> Vec<AuctionOverview> {
    AUCTIONS.with(|auctions| {
        auctions
            .borrow()
            .iter()
            .map(|auction| AuctionOverview {
                id: auction.id.clone(),
                item: auction.item.clone(),
            })
            .collect()
    })
}

/// Retrieve the detail information of auction by its id.
/// The returned detail contain status about whether the auction is active or closed,
/// and the bids make so far.
#[ic_cdk::update]
#[allow(non_snake_case)]
fn getAuctionDetails(auction_id: AuctionId) -> AuctionDetails {
    AUCTIONS.with(|auctions| {
        let auctions = auctions.borrow();
        let auction = auctions
            .iter()
            .find(|auction| auction.id == auction_id)
            .unwrap_or_else(|| ic_cdk::trap("Inexistent id"));
        let current_time = ic_cdk::api::time();
        let remaining_time = u64::checked_sub(auction.closing_time, current_time).unwrap();
        AuctionDetails {
            item: auction.item.clone(),
            bidHistory: auction.bid_history.clone(),
            remainingTime: Nat::from(remaining_time),
        }
    })
}

/// Internal helper function to retrieve the minimum price for the next bid in an auction.
/// The minimum price is one unit of the currency larger than the last bid.
fn minimum_price(auction: &Auction) -> Nat {
    auction
        .bid_history
        .last()
        .map_or(Nat::from(0usize), |bid| bid.price.clone())
        + 1usize
}

/// Make a new bid for a specific auction specified by the id.
/// Checks that:
/// * The user (`ic_cdk.caller()`) is authenticated.
/// * The price is valid, higher than the last bid, if existing.
/// * The auction is still open (not finished).
/// Behavior:
/// If valid, the bid is appended to the bid history.
/// Otherwise, traps with an error.
#[ic_cdk::update]
#[allow(non_snake_case)]
fn makeBid(auction_id: AuctionId, price: Nat) {
    let originator = ic_cdk::api::msg_caller();
    if originator == Principal::anonymous() {
        ic_cdk::trap("Anonymous caller");
    };
    AUCTIONS.with(|auctions| {
        let mut auctions = auctions.borrow_mut();
        let auction = auctions
            .iter_mut()
            .find(|auction| auction.id == auction_id)
            .unwrap_or_else(|| ic_cdk::trap("Inexistent id"));
        if price < minimum_price(auction) {
            ic_cdk::trap("Price too low");
        }
        let current_time = ic_cdk::api::time();
        if current_time >= auction.closing_time {
            ic_cdk::trap("Auction closed");
        }
        let time = Nat::from(u64::checked_sub(auction.closing_time, current_time).unwrap());
        let new_bid = Bid {
            price,
            time,
            originator,
        };
        auction.bid_history.push(new_bid);
    });
}
