# SC Execution Engine

This project aims to provide functionality for users to create fund pool to lock token, vest, designate beneficiaries, claim.
Supports both of singular and multi-sig method.

## project structure

I'll list here most important stuff, not literally everything

- [Anchor.toml](Anchor.toml) - main anchor config file, don't change anything here (it's already configured to work with Typescript tests)
- [package.json](package.json) - nothing special here apart from scripts to run anchor in a couple of ways
- [programs](programs) - where the Rust stuff lives
- [tests](tests) - where the blockchain E2E tests live
- [app](app) - where the web3 scripts and cli file live

## Prepare

Need to install all anchor development env.

```
  git -v
  node -v
  solana --version
    solana-cli 1.14.3 (src:fa1e3263; feat:940802714)
  rustup show
    rustc 1.71.1 (eb26296b5 2023-08-03)
  anchor --version
    anchor-cli 0.27.0
```

## Testing

- Install module dependencies

  ```
  yarn install
  anchor test
  ```

  \*\*\* Need to create global solana-cli keypair file for cli & unit test

- Running Commands

  ```
  yarn command <COMMAND>
  yarn command --help
  ```

## Feature Overview.

- Create pool

  Users can create vesting pool and set token, amount, locking period and minimal signatures count.
  This PDA is created by using the BaseKey as seed.

- Deposit Token

  Users can deposit token to the pool with the BaseKey which is used as seed of PDA publickey

- Nominate receiver

  Once users deposit tokens to vesting pool, they can set receivers to get token.

- Claim token

  After token lock period, receivers can claim token which is deposited on PDA with BaseKey
