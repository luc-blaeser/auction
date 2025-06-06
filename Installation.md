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

2. Install Mops, the package manager for Motoko (https://mops.one):

    ```
    curl -fsSL cli.mops.one/install.sh | sh
    ```

3. Install the **Motoko plugin** (by DFINITY Foundation) in Visual Studio Code.

    Menu: View -> Extensions:
    Search for "Motoko" (Motoko language support by DFINITY Foundation) and install this plugin.

    ![image](https://github.com/luc-blaeser/auction/assets/112870813/742d8cf8-f45b-4104-a6d7-455fa9d4a8a4)

4. Clone the Git repository for local development:

    ```
    git clone https://github.com/luc-blaeser/auction.git
    cd auction
    ```

Or, alternatively if you do not have Git installed, you can download the repository as a zip-file from: https://github.com/luc-blaeser/auction

5. Install the project package dependencies in the source folder:

    ```
    npm install
    ```

# Testing the Installation

You can run the application locally with **dfx**:

In the folder `auction` (of the local repository folder):
```
dfx start --clean --background
npm run setup
npm start
```

A local web frontend runs at: http://localhost:3000/

The application is not yet fully functional as backend features need to be implemented. This is the focus of the workshop.

The backend source code is in `src/motoko_backend`.

After testing, you can terminate the **npm** process (ctrl+c) and then stop **dfx**:
```
dfx stop
```

# Comparing to Other Languages

The workshop focuses on Motoko and there is an option to implement the same functionality in other backend languages (Rust and TypeScript) for comparison purposes. We recommend setting this up later during workshop when you have completed the Motoko backend.

## Rust (Optional)

1. Replace the `dfx.json` file:

    ```
    cp dfx_rust.json dfx.json
    ```

2. Install a recent version of Rust with WebAssembly support:

    ```
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    rustup target add wasm32-unknown-unknown
    ```

3. Install LLVM/Clang compiler:

    On Ubuntu/WSL:

    ```
    sudo apt-get install clang
    ```

    On Mac:

    ```
    brew install llvm
    ```

The backend source code is in `src/rust_backend`.

## Typescript (Optional)

1. Replace the `dfx.json` file:

    ```
    cp dfx_typescript.json dfx.json
    ```

2. Replace the `package.json` file:

    ```
    cp package_typescript.json package.json
    ```

3. Install `podman`:

    On Ubuntu/WSL:

    ```
    sudo apt-get install podman
    ```

    On Mac:

    ```
    brew install podman
    ```

The backend source code is in `src/typescript_backend`.

### Further Information

* [IC Installation Instructions](https://internetcomputer.org/docs/current/developer-docs/setup/install)
* [More detailed WSL 2 instructions](https://learn.microsoft.com/en-us/windows/wsl/install)
* [Motoko Documentation](https://internetcomputer.org/docs/current/motoko/main/motoko)
* [Motoko New Base Library](https://dfinity.github.io/new-motoko-base/)
* [TypeScript Development Kit for IC (Azle)](https://internetcomputer.org/docs/current/developer-docs/backend/typescript)
* [Rust Development Kit for IC](https://internetcomputer.org/docs/current/developer-docs/backend/rust)
