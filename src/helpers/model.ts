import { Address, BigInt } from "@graphprotocol/graph-ts";
import { store } from "@graphprotocol/graph-ts";

import { Hifi, Pool, Token, TokenBalance, Vault } from "../types/schema";
import { HifiPool as HifiPoolTemplate } from "../types/templates";
import { Erc20 as Erc20Contract } from "../types/templates/HifiPool/Erc20";
import { HifiPool as HifiPoolContract } from "../types/templates/HifiPool/HifiPool";
import { SINGLETON_INDEX } from "./constants";

export function getAccountTokenId(accountId: string, tokenId: string): string {
  return accountId.concat("-").concat(tokenId);
}

export function createHifi(): Hifi {
  let hifi: Hifi = new Hifi(SINGLETON_INDEX);
  hifi.listedBonds = [];
  hifi.listedCollaterals = [];
  hifi.pools = [];
  hifi.vaults = [];
  hifi.save();
  return hifi;
}

export function createPool(id: string): Pool {
  // Create the tracked contract based on the template.
  let hifiPoolAddress: Address = Address.fromString(id);
  HifiPoolTemplate.create(hifiPoolAddress);

  // Bind the HifiPool contract and read its state.
  let pool: Pool = new Pool(id);
  let contract: HifiPoolContract = HifiPoolContract.bind(hifiPoolAddress);
  pool.hToken = contract.hToken();
  pool.hTokenReserve = BigInt.fromI32(0).toBigDecimal();
  pool.maturity = contract.maturity();
  pool.swaps = [];
  pool.underlying = contract.underlying();
  pool.underlyingReserve = BigInt.fromI32(0).toBigDecimal();
  pool.save();

  // Push newly-created pool to the AMM.
  let hifi = loadOrCreateHifi();
  let pools = hifi.pools;
  pools.push(pool.id);
  hifi.pools = pools;
  hifi.save();

  return pool;
}

export function createToken(id: string): Token {
  let token: Token = new Token(id);
  let erc20: Erc20Contract = Erc20Contract.bind(Address.fromString(id));
  token.decimals = erc20.decimals();
  token.name = erc20.name();
  token.symbol = erc20.symbol();
  token.save();
  return token;
}

export function createTokenBalance(account: Address, token: Address): TokenBalance {
  let tokenBalance: TokenBalance = new TokenBalance(getAccountTokenId(account.toHex(), token.toHex()));
  tokenBalance.amount = BigInt.fromI32(0).toBigDecimal();
  tokenBalance.token = loadOrCreateToken(token.toHexString()).id;
  tokenBalance.save();
  return tokenBalance;
}

export function createVault(id: string, createTime: BigInt): Vault {
  let vault: Vault = new Vault(id);
  vault.collaterals = [];
  vault.createTime = createTime;
  vault.debts = [];
  vault.save();
  return vault;
}

export function loadOrCreateHifi(): Hifi {
  let hifi: Hifi | null = Hifi.load(SINGLETON_INDEX);
  if (hifi == null) {
    hifi = createHifi();
  }
  return hifi as Hifi;
}

export function loadOrCreatePool(id: string): Pool {
  let pool: Pool | null = Pool.load(id);
  if (pool == null) {
    pool = createPool(id);
  }
  return pool as Pool;
}

export function loadOrCreateToken(tokenId: string): Token {
  let token: Token | null = Token.load(tokenId);
  if (token == null) {
    token = createToken(tokenId);
  }
  return token as Token;
}

export function loadOrCreateTokenBalance(account: Address, token: Address): TokenBalance {
  let tokenBalance: TokenBalance | null = TokenBalance.load(getAccountTokenId(account.toHex(), token.toHex()));
  if (tokenBalance == null) {
    tokenBalance = createTokenBalance(account, token);
  }
  return tokenBalance as TokenBalance;
}

export function loadOrCreateVault(id: string, createTime: BigInt): Vault {
  let vault: Vault | null = Vault.load(id);
  if (vault == null) {
    vault = createVault(id, createTime);
  }
  return vault as Vault;
}

export function removePool(id: string): void {
  store.remove("Pool", id);
}
