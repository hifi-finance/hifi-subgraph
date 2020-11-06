import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";

import {
  Account,
  AccountFyToken,
  AccountFyTokenTransaction,
  Fintroller,
  FyToken,
  RedemptionPool,
  Token,
  Vault,
} from "../types/schema";
import { Erc20 as Erc20Contract } from "../types/templates/FyToken/Erc20";
import { Fintroller as FintrollerContract } from "../types/Fintroller/Fintroller";
import { FyToken as FyTokenContract } from "../types/templates/FyToken/FyToken";
import { FyToken as FyTokenTemplate } from "../types/templates";
import { addressZero, defaultLiquidationIncentive, fintrollerDefaultId, zeroBd } from "./constants";

export function getAccountFyTokenId(fyTokenId: string, accountId: string): string {
  return fyTokenId.concat("-").concat(accountId);
}

export function getAccountFyTokenTransactionId(accountId: string, txHash: Bytes, logIndex: BigInt): string {
  return accountId.concat("-").concat(txHash.toString()).concat("-").concat(logIndex.toString());
}

export function getEventId(txHash: Bytes, logIndex: BigInt): string {
  return txHash.concat("-").concat(logIndex);
}

export function getVaultId(fyTokenId: string, accountId: string): string {
  return getAccountFyTokenId(fyTokenId, accountId);
}

export function createAccount(id: string): Account {
  let account = new Account(id);
  account.countLiquidated = 0;
  account.countLiquidator = 0;
  account.save();
  return account;
}

export function createAccountFyToken(fyTokenId: string, accountId: string): AccountFyToken {
  let id: string = getAccountFyTokenId(fyTokenId, accountId);
  let accountFyToken: AccountFyToken = new AccountFyToken(id);
  accountFyToken.account = accountId;
  accountFyToken.fyToken = fyTokenId;
  accountFyToken.vault = id;
  accountFyToken.save();
  return accountFyToken;
}

export function createAccountFyTokenTransaction(
  fyTokenId: string,
  accountId: string,
  event: ethereum.Event,
): AccountFyTokenTransaction {
  let accountFyTokenId: string = getAccountFyTokenId(fyTokenId, accountId);
  let transactionId: string = getAccountFyTokenTransactionId(
    accountId,
    event.transaction.hash,
    event.transactionLogIndex,
  );
  let transaction: AccountFyTokenTransaction = new AccountFyTokenTransaction(transactionId);
  transaction.accountFyToken = accountFyTokenId;
  transaction.blockNumber = event.block.number.toI32();
  transaction.logIndex = event.transactionLogIndex.toI32();
  transaction.timestamp = event.block.timestamp.toI32();
  transaction.txHash = event.transaction.hash;
  transaction.save();
  return transaction;
}

export function createFintroller(): Fintroller {
  let fintroller = new Fintroller(fintrollerDefaultId);
  fintroller.liquidationIncentiveMantissa = defaultLiquidationIncentive;
  fintroller.oracle = addressZero;
  fintroller.save();
  return fintroller;
}

export function createFyToken(id: string): FyToken {
  // Create the tracked contract based on the template.
  let fyTokenId: Address = Address.fromString(id);
  FyTokenTemplate.create(fyTokenId);

  // Load the FyToken contract and it variables.
  let fyTokenContract: FyTokenContract = FyTokenContract.bind(fyTokenId);
  let collateralAddress: string = fyTokenContract.collateral().toString();
  let fintrollerAddress: string = fyTokenContract.fintroller().toString();
  let underlyingAddress: string = fyTokenContract.underlying().toString();

  // Load the Fintroller contract.
  let fintrollerContract: FintrollerContract = FintrollerContract.bind(Address.fromString(fintrollerAddress));

  // Load the collateral contract.
  let collateralContract: Erc20Contract = Erc20Contract.bind(Address.fromString(collateralAddress));
  let collateral: Token = new Token(collateralAddress.toString());
  collateral.decimals = collateralContract.decimals();
  collateral.name = collateralContract.name();
  collateral.symbol = collateralContract.symbol();
  collateral.save();

  // Load the underlying contract.
  let underlyingContract: Erc20Contract = Erc20Contract.bind(Address.fromString(underlyingAddress));
  let underlying: Token = new Token(underlyingAddress.toString());
  underlying.decimals = underlyingContract.decimals();
  underlying.name = underlyingContract.name();
  underlying.symbol = underlyingContract.symbol();
  underlying.save();

  // Create the FyToken entity.
  let fyToken: FyToken = new FyToken(id);
  fyToken.collateral = collateralAddress;
  fyToken.decimals = fyTokenContract.decimals();
  fyToken.debtCeiling = fintrollerContract.getBondDebtCeiling(fyTokenId).toBigDecimal();
  fyToken.expirationTime = fyTokenContract.expirationTime().toI32();
  fyToken.fintroller = fintrollerDefaultId;
  fyToken.name = fyTokenContract.name();
  fyToken.redemptionPool = fyTokenContract.redemptionPool().toString();
  fyToken.symbol = fyTokenContract.symbol();
  fyToken.totalSupply = fyTokenContract.totalSupply().toBigDecimal();
  fyToken.underlying = underlyingAddress;
  fyToken.save();

  return fyToken;
}

export function createRedemptionPool(id: string, fyTokenId: string): RedemptionPool {
  let redemptionPool: RedemptionPool = new RedemptionPool(id);
  redemptionPool.fyToken = fyTokenId;
  redemptionPool.totalUnderlyingSupply = zeroBd;
  return redemptionPool;
}

export function createVault(fyTokenId: string, accountId: string): Vault {
  // The Vault entity shares the id with the AccountFyToken entity.
  let id: string = getVaultId(fyTokenId, accountId);
  let vault: Vault = new Vault(id);
  vault.account = accountId;
  vault.debt = zeroBd;
  vault.freeCollateral = zeroBd;
  vault.fyToken = fyTokenId;
  vault.isOpen = true;
  vault.lockedCollateral = zeroBd;
  vault.save();
  return vault;
}

export function loadOrCreateAccount(id: string): Account {
  let account: Account | null = Account.load(id);
  if (account == null) {
    account = createAccount(id);
  }
  return account as Account;
}

export function loadOrCreateAccountFyToken(fyTokenId: string, accountId: string): AccountFyToken {
  let id: string = getAccountFyTokenId(fyTokenId, accountId);
  let accountFyToken: AccountFyToken | null = AccountFyToken.load(id);
  if (accountFyToken == null) {
    accountFyToken = createAccountFyToken(fyTokenId, accountId);
  }
  return accountFyToken as AccountFyToken;
}

export function loadOrCreateFintroller(): Fintroller {
  let fintroller: Fintroller | null = Fintroller.load(fintrollerDefaultId);
  if (fintroller == null) {
    fintroller = createFintroller();
  }
  return fintroller as Fintroller;
}

export function loadOrCreateFyToken(id: string): FyToken {
  let fyToken: FyToken | null = FyToken.load(id);
  if (fyToken == null) {
    fyToken = createFyToken(id);
  }
  return fyToken as FyToken;
}
