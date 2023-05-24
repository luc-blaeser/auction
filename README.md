# Motoko Auction Platform

Small, yet hopefully realistic example case for the Motoko workshop at KTH summer school (https://cysep.conf.kth.se/).

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
* Assign principal to bids.

## Open Issues/Extensions
* How to receive a proper `Error.reject` in the frontend. (The current version only traps.)
* Support other image formats than PNG.
* Do we have a data structure in the base library that can be stable and is non-functional for convenience? (The current version uses a custom `StableList`.)
* Could use a map instead of a list for the auctions.
* Permit bid only if signed in. How can we test whether a principal is anonymous?
* Get rid of some JS warnings in DFX deploy (minify).
* Deploy/test on mainnet
* ...
