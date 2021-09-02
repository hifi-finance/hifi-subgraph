import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Amm, Core, Pool, Token, TokenBalance, Vault } from "../types/schema";

import { Erc20 as Erc20Contract } from "../types/templates/HToken/Erc20";
import { HifiPool as HifiPoolContract } from "../types/templates/HifiPool/HifiPool";
import { HifiPool as HifiPoolTemplate } from "../types/templates";
import { SINGLETON_INDEX } from "./constants";
import { store } from "@graphprotocol/graph-ts";

export function getAccountTokenId(accountId: string, tokenId: string): string {
  return accountId.concat("-").concat(tokenId);
}

export function createAmm(): Amm {
  let amm: Amm = new Amm(SINGLETON_INDEX);
  amm.pools = [];
  amm.save();
  return amm;
}

export function createCore(): Core {
  let core: Core = new Core(SINGLETON_INDEX);
  core.listedBonds = [];
  core.listedCollaterals = [];
  core.vaults = [];
  core.save();
  return core;
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
  pool.underlyingPrecisionScalar = contract.underlyingPrecisionScalar();
  pool.underlyingReserve = BigInt.fromI32(0).toBigDecimal();
  pool.save();

  // Push newly-created pool to the AMM.
  let amm = loadOrCreateAmm();
  let pools = amm.pools;
  pools.push(pool.id);
  amm.pools = pools;
  amm.save();

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

export function loadOrCreateAmm(): Amm {
  let amm: Amm | null = Amm.load(SINGLETON_INDEX);
  if (amm == null) {
    amm = createAmm();
  }
  return amm as Amm;
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

export function loadOrCreateCore(): Core {
  let core: Core | null = Core.load(SINGLETON_INDEX);
  if (core == null) {
    core = createCore();
  }
  return core as Core;
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
