# Installation of the Internet Computer SDK

## On Windows
1. Install **Windows Subsystem for Linux**:

Run in the command line processor with administrator rights:
```
wsl --install
```

2. Install **node.js** in WSL: 

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
nvm install node
```

3. Install **dfx** (Internet Computer SDK): 

```
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
```

## On Linux/MacOS
1. Install **node.js**:

Under **Ubuntu**: 
```
sudo apt install npm
```

Under **MacOS**: 

Install package from the `node.js` webpage: https://nodejs.org/en/download

2. Install **dfx** (Internet Computer SDK): 

```
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
```

# Development Environment

We recommend **Visual Studio Code**, but you can also use any other IDE, if you prefer.

1. Install **Visual Studio Code**.

https://code.visualstudio.com/

2. If you choose Motoko for the workshop: Install the **Motoko plugin** (by DFINITY Foundation) in Visual Studio Code.

Menu: View -> Extensions:
Search for "Motoko" (Motoko language support by DFINITY Foundation) and install this plugin.

![image](https://github.com/luc-blaeser/auction/assets/112870813/742d8cf8-f45b-4104-a6d7-455fa9d4a8a4)

3. Clone the Git repository for local development:

```
git clone https://github.com/luc-blaeser/auction.git
```

Or, alternatively if you do not have Git installed, you can download the repository as a zip-file from: https://github.com/luc-blaeser/auction

# Preparing the Backend Language

You have a choice of three possible backend languages:

## Motoko (recommended)

No extra configuration is needed.

The backend source code is in `src/motoko_backend`.

## Typescript (code name Azle)

1. Replace the `dfx.json` file:

```
cp dfx_typescript.json dfx.json
```

The backend source code is in `src/typescript_backend`.

3. Install `podman`:

On Ubuntu/WSL:

```
sudo apt-get install podman
```

On Mac:

```
brew install podman
```

4. Install npm packages

```
npm install
```

## Rust

1. Replace the `dfx.json` file:

```
cp dfx_rust.json dfx.json
```

The backend source code is in `src/rust_backend`.

# Testing the Installation

You can run the application locally with **dfx**:

In the folder `auction` (of the local repository folder):
```
dfx start --clean --background
npm run setup
npm start
```

A local web frontend runs at: http://localhost:3000/

The application is not yet fully functional as the backend is not yet implemented. This is the focus of the workshop.

After testing, you can terminate the **npm** process and then stop **dfx**:
```
dfx stop
```

### Further Information

* [IC Installation Instructions](https://internetcomputer.org/docs/current/developer-docs/setup/install)
* [More detailed WSL 2 instructions](https://learn.microsoft.com/en-us/windows/wsl/install)
* [Motoko Documentation](https://internetcomputer.org/docs/current/motoko/main/motoko)
* [TypeScript Development Kit for IC (Azle)](https://internetcomputer.org/docs/current/developer-docs/backend/typescript)
* [Rust Development Kit for IC](https://internetcomputer.org/docs/current/developer-docs/backend/rust)
