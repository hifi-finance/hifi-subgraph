import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

import {
  Account,
  AccountFyToken,
  AccountFyTokenTransaction,
  Fintroller,
  FyToken,
  FyTokenTransfer,
  Token,
  Vault,
} from "../types/schema";
import { Erc20 as Erc20Contract } from "../types/templates/FyToken/Erc20";
import { Fintroller as FintrollerContract } from "../types/Fintroller/Fintroller";
import { FyToken as FyTokenContract } from "../types/templates/FyToken/FyToken";
import { FyToken as FyTokenTemplate } from "../types/templates";
import { addressZero, defaultLiquidationIncentive } from "./constants";

export function createAccount(id: string): Account {
  let account = new Account(id);
  account.countLiquidated = 0;
  account.countLiquidator = 0;
  return account;
}

export function createAccountFyToken(fyTokenAddress: string, account: string): AccountFyToken {
  const id: string = fyTokenAddress.concat("-").concat(account);
  let accountFyToken: AccountFyToken = new AccountFyToken(id);
  accountFyToken.account = account;
  accountFyToken.fyToken = fyTokenAddress;
  accountFyToken.vault = id;
  return accountFyToken;
}

export function createAccountFyTokenTransaction(account: string, event: ethereum.Event): AccountFyTokenTransaction {
  const id = account
    .concat("-")
    .concat(event.transaction.hash.toString())
    .concat("-")
    .concat(event.transactionLogIndex.toString());
  let transaction: AccountFyTokenTransaction = new AccountFyTokenTransaction(id);
  transaction.blockNumber = event.block.number.toI32();
  transaction.timestamp = event.block.timestamp.toI32();
  return transaction;
}

export function createFintroller(): Fintroller {
  let id: string = "1";
  let fintroller = new Fintroller(id);
  fintroller.liquidationIncentive = defaultLiquidationIncentive;
  fintroller.oracle = addressZero;
  return fintroller;
}

/**
 * Expects that the Fintroller entity is already created.
 */
export function createFyToken(id: string): FyToken {
  // Create the tracked contract based on the template.
  const fyTokenAddress: Address = Address.fromString(id);
  FyTokenTemplate.create(fyTokenAddress);

  // Load the FyToken contract and it variables.
  let fyTokenContract: FyTokenContract = FyTokenContract.bind(fyTokenAddress);
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

  // Create the database entity.
  let fyToken: FyToken = new FyToken(id);
  fyToken.collateral = collateralAddress;
  fyToken.decimals = fyTokenContract.decimals();
  fyToken.debtCeiling = fintrollerContract.getBondDebtCeiling(fyTokenAddress).toBigDecimal();
  fyToken.expirationTime = fyTokenContract.expirationTime();
  fyToken.fintroller = "1"; // The id of the Fintroller is always 1
  fyToken.name = fyTokenContract.name();
  fyToken.symbol = fyTokenContract.symbol();
  fyToken.totalSupply = fyTokenContract.totalSupply();
  fyToken.underlying = underlyingAddress;

  return fyToken;
}

export function createVault(fyTokenAddress: string, account: string): Vault {
  const id: string = fyTokenAddress.concat("-").concat(account);
  let vault: Vault = new Vault(id);
  vault.account = account;
  vault.accountFyToken = id;
  vault.debt = BigInt.fromI32(0);
  vault.freeCollateral = BigInt.fromI32(0);
  vault.fyToken = fyTokenAddress;
  vault.isOpen = true;
  vault.lockedCollateral = BigInt.fromI32(0);

  return vault;
}

export function loadOrCreateAccount(id: string): Account {
  let account: Account | null = Account.load(id);
  if (account == null) {
    account = createAccount(id);
  }
  return account;
}

export function loadOrCreateAccountFyToken(fyTokenAddress: string, account: string): AccountFyToken {
  const id: string = fyTokenAddress.concat("-").concat(account);
  let accountFyToken: AccountFyToken | null = AccountFyToken.load(id);
  if (accountFyToken == null) {
    accountFyToken = createAccountFyToken(fyTokenAddress, account);
  }
  return accountFyToken;
}

export function loadOrCreateFintroller(): Fintroller {
  const id: string = "1";
  let fintroller: Fintroller | null = Fintroller.load(id);
  if (fintroller == null) {
    fintroller = createFintroller();
  }
  return fintroller;
}

export function loadOrCreateFyToken(id: string): FyToken {
  let fyToken: FyToken | null = FyToken.load(id);
  if (fyToken == null) {
    fyToken = createFyToken(id);
  }
  return fyToken;
}
