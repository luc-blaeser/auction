# Internet Computer Auction Platform

Application case for the IC blockchain programming workshop at KTH summer school (https://cysep.conf.kth.se/).

A simple auction platform that allows to:
* Open and view auctions
* Bid within defined deadline
* Authenticate by Internet Identity

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

You can focus on the backend development with Motoko: 

`src/backend/AuctionServer.mo`

Functionality to add:
* Storing and retrieving the auction data in the actor. Prefer `stable` variable(s).
* Implementing the public functions of the actor.
* Associating an id (`Nat`) to each stored auction for later retrievel.
* Using a periodic timer (library `mo:base/Timer`, `Timer.recurringTimer`) to terminate the auctions. 
  For example, a second-interval-timer could decrement the remaining time of each open auction.

Particular checks needed for a bid:
* The auction must not be ended.
* The price needs to be higher than the last bid (or it needs to be the first bid).
* The user needs to be authenticated, i.e. it is not anonymous (using `Principal.isAnonymous()`).

[Code Structure](Structure.md)

## Documentation

* [IC Blockchain Programming Tutorial Slides](Motoko_Tutorial.pdf)
* [Motoko Language](https://internetcomputer.org/docs/current/motoko/main/motoko)
* [Motoko Base Library](https://internetcomputer.org/docs/current/motoko/main/base)

# Workshop Solution

* An example solution with a complete Motoko backend implementation is available in the [Git branch `solution`](https://github.com/luc-blaeser/auction/tree/solution).
