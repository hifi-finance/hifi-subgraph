import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Core, TokenBalance, Vault } from "../types/schema";

import { SINGLETON_INDEX } from "./constants";

export function getAccountTokenId(accountId: string, tokenId: string): string {
  return accountId.concat("-").concat(tokenId);
}

export function createCore(): Core {
  let core: Core = new Core(SINGLETON_INDEX);
  core.listedBonds = [];
  core.listedCollaterals = [];
  core.vaults = [];
  core.save();
  return core;
}

export function createTokenBalance(account: Address, token: Address): TokenBalance {
  let tokenBalance: TokenBalance = new TokenBalance(getAccountTokenId(account.toHex(), token.toHex()));
  tokenBalance.amount = BigInt.fromI32(0);
  tokenBalance.token = token;
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
