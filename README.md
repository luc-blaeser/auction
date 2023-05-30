# Motoko Auction Platform

Application case for the Motoko workshop at KTH summer school (https://cysep.conf.kth.se/).

A simple auction platform that allows to:
* Open and view auctions
* Bid within defined deadline

Specific features:
* Use Internet identity as originator for bid.
* Upload auction image (currently only PNG).
* Timer-based auction end.
* Check price and time per bid.
* Multi-user synchronization.
* Showing auction history.

## Installation

[Installation instructions](Installation.md)

## Running the Application

```
dfx start --clean --background
npm run setup
npm start
```

Local frontend: `http://127.0.0.1:3000/`

# Code Structure

The code template contains three canisters, as defined `dfx.json`:
* Motoko backend: `src/backend/` <-- **Focus of this workshop.**
* Web frontend: `src/frontend/` (already pre-implemented, using React and Typescript)
* Internet Identity: Used for authentication. The binary is downloaded during local development.

# Workshop Goals

You can focus on the backend development with Motoko: 

`src/backend/AuctionServer.mo`

Functionality to add:
* Storing and retrieving the auction data in the actor. Prefer `stable` variable(s).
* Implementing the public functions of the actor.
* Associating an id (`Nat`) to each stored auction for later retrievel.
* Using a periodic timer (library `mo:base/Timer`, `Timer.recurringTimer`) to terminate the auctions. 
  For example, a second-interval-timer could decrement the remaining time of each open auction.

Particular checks needed on a bid:
* The auction must not be ended.
* The price needs to be higher than the last bid (or it needs to be the first bid).
* The user needs to be authenticated, i.e. it is not anonymous (using `Principal.isAnonymous()`).

# Documentation

* [Motoko Language](https://internetcomputer.org/docs/current/motoko/main/motoko)
* [Motoko Base Library](https://internetcomputer.org/docs/current/motoko/main/base)
