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

### On Windows
1. Install **Windows Subsystem for Linux**:

Run in the command line processor with administrator rights:
```
wsl --install
```

(More instructions: https://learn.microsoft.com/en-us/windows/wsl/install)

2. Install **Node.js**: 

(***tbd***: special installation under WSL needed)


3. Install **dfx** (Internet Computer SDK): 

```
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
```

### On Linux/MacOS
1. Install **Node.js**:

(***tbd***: different installations depending on OS distributor)

2. Install **dfx** (Internet Computer SDK): 

```
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
```

## Development Environment
* Clone or download the Git repository for local development.
* **Visual Studio Code** with the **Motoko plugin** (by DFINITY Foundation) offers a convenient development environment.

## Starting the Application

For local testing and development:

```
dfx start --clean --background
npm run setup
npm start
```

A local web frontend runs at: `http://127.0.0.1:3000/`

Hints for login via Internet Idenity:
* Use **Chrome** browser. (Currently, Firefox may have some issues with the login.)
* Disable the **popup blocker** for the local frontend URL during development.

## Workshop Goals
Develop the backend in Motoko.

The Motoko source code is located at: `<repo-directory>/backend/Main.mo`

Things to realize:
* Storing and retrieving the auction data in the actor. Prefer `stable` variable(s).
* Implementing the actor functionality: All public functions in the code skeleton.
* Associating an id (`Nat`) to each stored auction for later retrievel.
* Using a periodic timer (library `mo:base/Timer`, `Timer.recurringTimer`) to end the auctions. E.g. on every second, the remaining time of each open auction could be decreased.

Particular checks on a bid:
* The auction must not be ended.
* The price needs to be higher than the last bid (or it needs to be the first bid).
* The user needs to be authenticated, i.e. it is not anonymous (using `Principal.isAnonymous()`).

## Deployment on the IC

***tbd***

## More Resources

* Motoko Language Documentation: https://internetcomputer.org/docs/current/motoko/main/motoko
* Motoko Base Library: https://internetcomputer.org/docs/current/motoko/main/base/
* Installation Instructions: https://internetcomputer.org/docs/current/developer-docs/setup/install