# Code Structure

The code template contains multiple canisters:
* Backend: <-- **Focus of this workshop**
    
    This depends on your language choice:
    - **Motoko** (recommended): `src/motoko_backend/`
    - Rust: `src/rust_backend/`
    - Typescript (beta): `src/typescript_backend/`
    
* Web frontend: `src/frontend/` Already pre-implemented, using React and Typescript.
* Internet Identity: Used for authentication. The binary is downloaded during local development.

See `Installation.md` on how to select the backend language and configure `dfx.json`.
