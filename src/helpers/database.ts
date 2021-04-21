import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";

import { Fintroller as FintrollerContract } from "../types/Fintroller/Fintroller";
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
import { FyToken as FyTokenTemplate } from "../types/templates";
import { Erc20 as Erc20Contract } from "../types/templates/FyToken/Erc20";
import { FyToken as FyTokenContract } from "../types/templates/FyToken/FyToken";
import { addressZero, defaultLiquidationIncentive, fintrollerDefaultId, mantissaBd, zeroBd } from "./constants";

export function getAccountFyTokenId(fyTokenId: string, accountId: string): string {
  return fyTokenId.concat("-").concat(accountId);
}

export function getAccountFyTokenTransactionId(accountId: string, txHash: Bytes, logIndex: BigInt): string {
  return accountId.concat("-").concat(txHash.toHexString()).concat("-").concat(logIndex.toString());
}

export function getEventId(txHash: Bytes, logIndex: BigInt): string {
  return txHash.toHexString().concat("-").concat(logIndex.toString());
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
  accountFyToken.fyTokenBalance = zeroBd;
  accountFyToken.totalFyTokenBorrowed = zeroBd;
  accountFyToken.totalFyTokenRedeemed = zeroBd;
  accountFyToken.totalFyTokenRepaid = zeroBd;
  accountFyToken.totalUnderlyingRedeemed = zeroBd;
  accountFyToken.totalUnderlyingSupplied = zeroBd;
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
  let fyTokenAddress: Address = Address.fromString(id);
  FyTokenTemplate.create(fyTokenAddress);

  // Bind the FyToken contract and read its state.
  let fyTokenContract: FyTokenContract = FyTokenContract.bind(fyTokenAddress);
  let collateralId: string = fyTokenContract.collateral().toHexString();
  let fintrollerAddress: string = fyTokenContract.fintroller().toHexString();
  let underlyingId: string = fyTokenContract.underlying().toHexString();

  // Bind the Fintroller contract.
  let fintrollerContract: FintrollerContract = FintrollerContract.bind(Address.fromString(fintrollerAddress));

  // Create the token entities.
  createToken(collateralId);
  createToken(underlyingId);

  // Create the RedemptionPool entity.
  let redemptionPoolId: string = fyTokenContract.redemptionPool().toHexString();
  let fyTokenId: string = fyTokenAddress.toHexString();
  createRedemptionPool(redemptionPoolId, fyTokenId);

  // Create the FyToken entity.
  let fyToken: FyToken = new FyToken(fyTokenId);
  fyToken.collateral = collateralId;
  fyToken.collateralizationRatio = fintrollerContract
    .getBondCollateralizationRatio(fyTokenAddress)
    .toBigDecimal()
    .div(mantissaBd);
  fyToken.decimals = fyTokenContract.decimals();
  fyToken.debtCeiling = fintrollerContract.getBondDebtCeiling(fyTokenAddress).toBigDecimal().div(mantissaBd);
  fyToken.expirationTime = fyTokenContract.expirationTime().toI32();
  fyToken.fintroller = fintrollerDefaultId;
  fyToken.name = fyTokenContract.name();
  fyToken.redemptionPool = redemptionPoolId;
  fyToken.symbol = fyTokenContract.symbol();
  fyToken.totalSupply = fyTokenContract.totalSupply().toBigDecimal().div(mantissaBd);
  fyToken.underlying = underlyingId;
  fyToken.save();

  return fyToken;
}

export function createRedemptionPool(id: string, fyTokenId: string): RedemptionPool {
  let redemptionPool: RedemptionPool = new RedemptionPool(id);
  redemptionPool.fyToken = fyTokenId;
  redemptionPool.totalUnderlyingSupply = zeroBd;
  redemptionPool.save();
  return redemptionPool;
}

// Safe to call the "decimals", "name" and "symbol" methods directly because we control the tokens that get listed
// on Hifi. In the future, we may have to use the fail-safe "try_" functions, because some tokens like MKR and SAI
// return the name and the symbol as a bytes32.
export function createToken(id: string): Token {
  let contract: Erc20Contract = Erc20Contract.bind(Address.fromString(id));
  let token: Token = new Token(id);
  token.decimals = contract.decimals();
  token.name = contract.name();
  token.symbol = contract.symbol();
  token.save();
  return token;
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

export function loadOrCreateToken(id: string): Token {
  let token: Token | null = Token.load(id);
  if (token == null) {
    token = createToken(id);
  }
  return token as Token;
}
