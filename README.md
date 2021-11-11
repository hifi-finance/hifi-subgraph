# Hifi Subgraph

Hifi is a fixed-rate, fixed-term lending protocol built on the Ethereum blockchain. This subgraph indexes the events
emitted by our smart contracts.

You can interact with the subgraph via The Graph's [hosted service](https://thegraph.com/legacy-explorer/subgraph/hifi-finance/hifi-v1).

## Queries

Below are a few ways to show how to query the Hifi Subgraph for data. The queries show most of the information
that is queryable, but there are many other filtering options that can be used, just check out the querying api.

You can also see the saved queries on the hosted service for examples.

### Vaults

```graphql
{
  vaults(first: 5) {
    id
    createTime
    collaterals {
      id
      amount
      token {
        id
      }
    }
    debts {
      id
      amount
      token {
        id
      }
    }
  }
}
```
