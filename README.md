# Internet Computer Auction Platform

Application case for the IC blockchain programming workshop at KTH summer school (https://cysep.conf.kth.se/).

A simple auction platform that allows to:
* Open and view auctions
* Bid within defined deadline
* Authenticate by Internet Identity

## Language Choice

You can choose from the following programming languages for the implementation:

* **Motoko** (recommended)
* Typescript (code name Azle on the IC)
* Rust

## Setup

[Installation instructions](Installation.md)

Running the application:

```
dfx start --clean --background
npm run setup
npm start
```

Local frontend: http://localhost:3000/

## Workshop Goals

You can focus on the backend development: 

* For Motoko: `src/motoko-backend/AuctionServer.mo`
* For Typescript: `src/typescript-backend/src/index.ts`
* For Rust: `src/rust-backend/src/lib.rs`

Functionality to add:
* Storing and retrieving the auction data in the actor.
* Implementing the public functions of the actor.
* Associating an id (`Nat`) to each stored auction for later retrievel.
* Using a periodic timer (library `mo:base/Timer`, `Timer.recurringTimer`) to terminate the auctions. 
  For example, a second-interval-timer could decrement the remaining time of each open auction.

Particular checks needed for a bid:
* The auction must not be ended.
* The price needs to be higher than the last bid (or it needs to be the first bid).
* The user needs to be authenticated, i.e. it is not anonymous (using `Principal.isAnonymous()`).

Optional: Support canister upgrades:
* In Motoko: Use `stable` variables in the actor.
* In Rust/Typescript: This is more complicated. See the documentation for "stable data structures".

[Code Structure](Structure.md)

## Documentation

* [IC Blockchain Programming Tutorial Slides](Motoko_Tutorial.pdf)
* [Motoko Language](https://internetcomputer.org/docs/current/motoko/main/motoko)
* [Motoko Base Library](https://internetcomputer.org/docs/current/motoko/main/base)
* [TypeScript Development Kit for IC (Azle)](https://internetcomputer.org/docs/current/developer-docs/backend/typescript)
* [Rust Development Kit for IC](https://internetcomputer.org/docs/current/developer-docs/backend/rust)

# Workshop Solution

* An example solution with a working backend implementation in Motoko, Typescript, and Rust is available in the [Git branch `solution`](https://github.com/luc-blaeser/auction/tree/solution).
(Note: The Rust and Typescript backend do not yet support canister upgrades.)
