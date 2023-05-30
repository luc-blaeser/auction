# Installation

## On Windows
1. Install **Windows Subsystem for Linux**:

Run in the command line processor with administrator rights:
```
wsl --install
```

[More detailed WSL 2 instructions](https://learn.microsoft.com/en-us/windows/wsl/install)

2. Install **Node.js**: 

(***tbd***: special installation under WSL needed)


3. Install **dfx** (Internet Computer SDK): 

```
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
```

## On Linux/MacOS
1. Install **Node.js**:

(***tbd***: different installations depending on OS distributor)

2. Install **dfx** (Internet Computer SDK): 

```
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
```

## More Details

[IC Installation Instructions](https://internetcomputer.org/docs/current/developer-docs/setup/install)

# Development Environment
* Clone or download the Git repository for local development.
* **Visual Studio Code** with the **Motoko plugin** (by DFINITY Foundation) offers a convenient development environment.
* Internet connection is needed for local testing and development.

# Running the Application

For local testing and development:

```
dfx start --clean --background
npm run setup
npm start
```

A local web frontend runs at: `http://127.0.0.1:3000/`

# Web Browser

The following browser configuration is recommended:
* **Chrome** browser. (Currently, Firefox has some issues with Internet Identity login.)
* Disable the **popup blocker** for the local frontend URL during development.

