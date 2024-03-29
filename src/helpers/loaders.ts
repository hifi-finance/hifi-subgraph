import { Address, BigInt } from "@graphprotocol/graph-ts";

import { Hifi, Pool, Position, Token, Vault } from "../types/schema";
import { HifiPool as HifiPoolTemplate } from "../types/templates";
import { Erc20 as Erc20Contract } from "../types/templates/HifiPool/Erc20";
import { HifiPool as HifiPoolContract } from "../types/templates/HifiPool/HifiPool";
import { defaultHifiId, zeroBd } from "./constants";

export function getAccountTokenId(accountId: string, tokenId: string): string {
  return accountId.concat("-").concat(tokenId);
}

export function createHifi(): Hifi {
  let hifi: Hifi = new Hifi(defaultHifiId);
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
  let hTokenId: string = contract.hToken().toHexString();
  let hToken: Token = loadOrCreateToken(hTokenId);
  let underlyingId: string = contract.underlying().toHexString();
  let underlying: Token = loadOrCreateToken(underlyingId);
  pool.hToken = hToken.id;
  pool.hTokenReserve = zeroBd;
  pool.maturity = contract.maturity();
  pool.underlying = underlying.id;
  pool.underlyingReserve = zeroBd;
  pool.save();
  return pool;
}

export function createPosition(account: Address, asset: Address): Position {
  let positionId: string = getAccountTokenId(account.toHexString(), asset.toHexString());
  let position: Position = new Position(positionId);
  let tokenId: string = asset.toHexString();
  let token: Token = loadOrCreateToken(tokenId);
  position.amount = zeroBd;
  position.token = token.id;
  position.save();
  return position;
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

export function createVault(id: string, createTime: BigInt): Vault {
  let vault: Vault = new Vault(id);
  vault.collaterals = [];
  vault.createTime = createTime;
  vault.debts = [];
  vault.save();
  return vault;
}

export function loadOrCreateHifi(): Hifi {
  let hifi: Hifi | null = Hifi.load(defaultHifiId);
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

export function loadOrCreatePosition(account: Address, asset: Address): Position {
  let accountId: string = account.toHexString();
  let tokenId: string = asset.toHexString();
  let positionId: string = getAccountTokenId(accountId, tokenId);
  let position: Position | null = Position.load(positionId);
  if (position == null) {
    position = createPosition(account, asset);
  }
  return position as Position;
}

export function loadOrCreateToken(tokenId: string): Token {
  let token: Token | null = Token.load(tokenId);
  if (token == null) {
    token = createToken(tokenId);
  }
  return token as Token;
}

export function loadOrCreateVault(id: string, createTime: BigInt): Vault {
  let vault: Vault | null = Vault.load(id);
  if (vault == null) {
    vault = createVault(id, createTime);
  }
  return vault as Vault;
}
