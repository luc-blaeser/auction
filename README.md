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


## Workshop Tasks

* Complete the Motoko backend for the auction platform:
  - Auction bidding
  - User authorization
  - Auction rules

* Bonus implementation tasks:
  - Unpredictable auction ids
  - Implement in other languages: Rust, TypeScript
  - Compare implementation across languages

[Code Structure](Structure.md)

## Documentation

* [Motoko Lecture Slides](MotokoTalkCySeP2025.pdf)
* [Motoko Language](https://internetcomputer.org/docs/current/motoko/main/motoko)
* [Motoko Base Library](https://internetcomputer.org/docs/current/motoko/main/base)
* [TypeScript Development Kit for IC (Azle)](https://internetcomputer.org/docs/current/developer-docs/backend/typescript)
* [Rust Development Kit for IC](https://internetcomputer.org/docs/current/developer-docs/backend/rust)

# Workshop Solution

* An example solution with a working backend implementation in Motoko, Typescript, and Rust is available in the [Git branch `solution`](https://github.com/luc-blaeser/auction/tree/solution).
(Note: The Rust and Typescript backend do not yet support canister upgrades.)
