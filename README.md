# Motoko Auction Platform

Small, yet hopefully realistic example case for the Motoko workshop at KTH summer school (https://cysep.conf.kth.se/).

## Setup

```
dfx start --clean --background
npm run setup
npm start
```

Local frontend at `http://127.0.0.1:3000/`

## Deployment

```
dfx deploy
```

## Use Cases
* Open and view auctions
* Bid within defined deadline

## Features
* Use Internet identity as originator for bid.
* Upload image (currently PNG) to show auction item.
* Timer-based auction end.
* Check price and time per bid
* Multi-user synchronization
* Showing auction history.

## Motoko Programming Aspects
* Storing and retrieving auction data.
* Validating incoming bids.
* Using timers for auction closing.
* Using stable variable (ideally without upgrade hooks).
* Assign non-anonymous principal to bid.

## Open Issues/Extensions
* How to receive a proper `Error.reject` in the frontend. (The current version only traps.)
* Support other image formats than PNG.
* Could use a map instead of a list for the auctions.
* Get rid of some JS warnings in DFX deploy (minify).
* Deploy/test on mainnet
* ...
