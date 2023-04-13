# Hifi Subgraph

[Hifi](https://hifi.finance) is a fixed-rate, fixed-term lending protocol on Ethereum. This subgraph tracks the Hifi Finance lending protocol data, including positions, tokens, vaults, pools, and swaps.

## Prerequisites

- NVM
- Yarn package manager

## Set Up

1. Clone the repository:

```bash
$ git clone https://github.com/hifi-finance/hifi-subgraph.git
$ cd hifi-subgraph
```

2. Set the version of Node to use locally within the project:

```bash
$ nvm use
```

3. Install the dependencies with Yarn:

```bash
$ yarn install
```

## Running Locally

Make sure to update package.json settings to point to your own graph account.

## Features

- Data on positions, tokens, vaults, pools, and swaps
- Aggregated data across Hifi entities
- Historical data on Hifi entities

## Queries

You can use the following entities to query the Hifi subgraph for data: Position, Token, Hifi, Vault, Pool, and Swap. Check out the [querying api](https://thegraph.com/docs/en/querying/graphql-api/) for more filtering options. These queries can be used locally or in The Graph Explorer playground.

## Key Entity Overviews

#### Position

Represents a collateral or debt position.

#### Token

Represents a basic ERC20 token.

#### Hifi

High-level overview of the Hifi Finance protocol.

#### Vault

Stores the collaterals deposited by the user, along with the debts.

#### Pool

Stores the AMM pool reserves, along with the swaps.

#### Swap

Contains data on specific AMM swaps.

## Example Queries

### Querying Aggregated Hifi Data

This query fetches aggregated data from all Hifi entities to give a view of the overall activity in the Hifi Finance protocol.

```graphql
{
  hifi(id: "1") {
    listedBonds {
      id
      name
      symbol
    }
    listedCollaterals {
      id
      name
      symbol
    }
    pools {
      id
      hToken {
        id
        name
        symbol
      }
      underlying {
        id
        name
        symbol
      }
    }
    vaults {
      id
      collaterals {
        id
        amount
        token {
          id
          name
          symbol
        }
      }
      debts {
        id
        amount
        token {
          id
          name
          symbol
        }
      }
    }
  }
}
```
