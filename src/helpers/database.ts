import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

import { Account, AccountFyToken, AccountFyTokenTransaction, Fintroller, FyToken, Token, Vault } from "../types/schema";
import { Erc20 as Erc20Contract } from "../types/templates/FyToken/Erc20";
import { Fintroller as FintrollerContract } from "../types/Fintroller/Fintroller";
import { FyToken as FyTokenContract } from "../types/templates/FyToken/FyToken";
import { FyToken as FyTokenTemplate } from "../types/templates";
import { addressZero, defaultLiquidationIncentive, fintrollerId } from "./constants";

export function createAccount(id: string): Account {
  let account = new Account(id);
  account.countLiquidated = 0;
  account.countLiquidator = 0;
  account.save();
  return account;
}

export function createAccountFyToken(fyTokenId: string, accountId: string): AccountFyToken {
  let id: string = fyTokenId.concat("-").concat(accountId);
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
  let accountFyTokenId: string = fyTokenId.concat("-").concat(accountId);
  let id = accountId
    .concat("-")
    .concat(event.transaction.hash.toString())
    .concat("-")
    .concat(event.transactionLogIndex.toString());
  let transaction: AccountFyTokenTransaction = new AccountFyTokenTransaction(id);
  transaction.accountFyToken = accountFyTokenId;
  transaction.blockNumber = event.block.number.toI32();
  transaction.logIndex = event.transactionLogIndex;
  transaction.timestamp = event.block.timestamp.toI32();
  transaction.txHash = event.transaction.hash;
  transaction.save();
  return transaction;
}

export function createFintroller(): Fintroller {
  let fintroller = new Fintroller(fintrollerId);
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
  fyToken.expirationTime = fyTokenContract.expirationTime();
  fyToken.fintroller = fintrollerId; // The id of the Fintroller is always 1
  fyToken.name = fyTokenContract.name();
  fyToken.symbol = fyTokenContract.symbol();
  fyToken.totalSupply = fyTokenContract.totalSupply();
  fyToken.underlying = underlyingAddress;
  fyToken.save();

  return fyToken;
}

export function createVault(fyTokenId: string, accountId: string): Vault {
  let id: string = fyTokenId.concat("-").concat(accountId);
  let vault: Vault = new Vault(id);
  vault.account = accountId;
  vault.debt = BigInt.fromI32(0);
  vault.freeCollateral = BigInt.fromI32(0);
  vault.fyToken = fyTokenId;
  vault.isOpen = true;
  vault.lockedCollateral = BigInt.fromI32(0);
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
  let id: string = fyTokenId.concat("-").concat(accountId);
  let accountFyToken: AccountFyToken | null = AccountFyToken.load(id);
  if (accountFyToken == null) {
    accountFyToken = createAccountFyToken(fyTokenId, accountId);
  }
  return accountFyToken as AccountFyToken;
}

export function loadOrCreateFintroller(): Fintroller {
  let fintroller: Fintroller | null = Fintroller.load(fintrollerId);
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
