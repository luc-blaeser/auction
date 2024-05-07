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

// NOTE: UPGRADES ARE NOT YET SUPPORTED. THIS WOULD NEED STABLE DATA STRUCTURES!

thread_local! {
    /// List of all auctions.
    static AUCTIONS: RefCell<Vec<Auction>> = const { RefCell::new(vec![]) };

    /// Counter for generating new auction ids.
    static ID_COUNTER: RefCell<Nat> = RefCell::new(Nat::from(0usize));
}

/// Timer event occurring every second, decreasing the remaining
/// time of each active (unfinished) auction.
fn tick() {
    AUCTIONS.with(|auctions| {
        for auction in auctions.borrow_mut().iter_mut() {
            if auction.details.remainingTime > 0usize {
                auction.details.remainingTime -= 1usize;
            };
        }
    });
}

/// Installing a timer on canister initialization.
/// The timer needs to be reinstalled on canister upgrade.
#[ic_cdk::init]
fn init() {
    let interval = std::time::Duration::from_secs(1);
    ic_cdk_timers::set_timer_interval(interval, tick);
}

#[ic_cdk::post_upgrade]
fn post_upgrade() {
    init();
}

/// Internal function for generating a new auction id by using the `idCounter`.
fn new_auction_id() -> AuctionId {
    ID_COUNTER.with(|counter| {
        let result = counter.borrow().clone();
        *counter.borrow_mut() += 1usize;
        result
    })
}

/// Register a new auction that is open for the defined duration.
#[ic_cdk::update]
#[allow(non_snake_case)]
fn newAuction(item: Item, duration: Nat) {
    let id = new_auction_id();
    let new_auction = Auction {
        id,
        details: AuctionDetails {
            item,
            bidHistory: vec![],
            remainingTime: duration,
        },
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
                item: auction.details.item.clone(),
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
        auction.details.clone()
    })
}

/// Internal helper function to retrieve the minimum price for the next bid in an auction.
/// The minimum price is one unit of the currency larger than the last bid.
fn minimum_price(auction: &Auction) -> Nat {
    auction
        .details
        .bidHistory
        .last()
        .map_or(Nat::from(0usize), |bid| bid.price.clone())
        + 1usize
}

/// Make a new bid for a specific auction specified by the id.
/// Checks that:
/// * The user (`message.caller`) is authenticated.
/// * The price is valid, higher than the last bid, if existing.
/// * The auction is still open (not finished).
/// If valid, the bid is appended to the bid history.
/// Otherwise, traps with an error.
#[ic_cdk::update]
#[allow(non_snake_case)]
fn makeBid(auction_id: AuctionId, price: Nat) {
    let originator = ic_cdk::caller();
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
        let time = auction.details.remainingTime.clone();
        if time == 0usize {
            ic_cdk::trap("Auction closed");
        }
        let new_bid = Bid {
            price,
            time,
            originator,
        };
        auction.details.bidHistory.push(new_bid);
    });
}
