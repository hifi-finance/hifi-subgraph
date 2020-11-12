import { Address, BigDecimal, log } from "@graphprotocol/graph-ts";

import {
  Account,
  AccountFyToken,
  BorrowEvent,
  BurnEvent,
  FyToken,
  FyTokenTransferEvent,
  LiquidateBorrowEvent,
  MintEvent,
  RepayBorrowEvent,
  Token,
} from "../types/schema";
import { Borrow, Burn, LiquidateBorrow, Mint, RepayBorrow, Transfer } from "../types/templates/FyToken/FyToken";
import {
  createAccountFyTokenTransaction,
  getAccountFyTokenId,
  getEventId,
  loadOrCreateAccount,
  loadOrCreateAccountFyToken,
} from "../helpers/database";
import { fyTokenDecimalsBd } from "../helpers/constants";

export function handleBorrow(event: Borrow): void {
  let borrowerId: string = event.params.account.toHexString();
  let borrowAmount: BigDecimal = event.params.repayAmount.toBigDecimal(); // TODO: fix this typo in Solidity

  loadOrCreateAccount(borrowerId);

  let fyTokenId: string = event.address.toHexString();
  let accountFyToken: AccountFyToken = loadOrCreateAccountFyToken(fyTokenId, borrowerId);
  accountFyToken.totalFyTokenBorrowed = accountFyToken.totalFyTokenBorrowed.plus(borrowAmount);
  accountFyToken.save();

  createAccountFyTokenTransaction(fyTokenId, borrowerId, event);

  // We can assume that the FyToken entity exists since bonds have to be
  // listed in the Fintroller before a borrow can occur.
  let fyToken: FyToken | null = FyToken.load(fyTokenId);

  // Create the BorrowEvent entity.
  let borrowEventId: string = getEventId(event.transaction.hash, event.transactionLogIndex);
  let borrowEvent: BorrowEvent = new BorrowEvent(borrowEventId);
  borrowEvent.amount = borrowAmount;
  borrowEvent.blockNumber = event.block.number.toI32();
  borrowEvent.from = Address.fromString(fyTokenId);
  borrowEvent.fyTokenSymbol = fyToken.symbol;
  borrowEvent.timestamp = event.block.timestamp.toI32();
  borrowEvent.to = Address.fromString(borrowerId);
  borrowEvent.save();
}

export function handleBurn(event: Burn): void {
  // We can assume that the FyToken entity exists because bonds have to
  // be listed in the Fintroller before a burn can occur.
  let fyTokenId: string = event.address.toHexString();
  let fyToken: FyToken | null = FyToken.load(fyTokenId);

  // Create the BurnEvent entity.
  let burnEventId: string = getEventId(event.transaction.hash, event.transactionLogIndex);
  let burnEvent: BurnEvent = new BurnEvent(burnEventId);
  burnEvent.amount = event.params.burnAmount.toBigDecimal();
  burnEvent.blockNumber = event.block.number.toI32();
  burnEvent.from = event.params.account;
  burnEvent.fyTokenSymbol = fyToken.symbol;
  burnEvent.timestamp = event.block.timestamp.toI32();
  burnEvent.to = Address.fromString(fyTokenId);
  burnEvent.save();
}

export function handleLiquidateBorrow(event: LiquidateBorrow): void {
  let borrowerId: string = event.params.borrower.toHexString();
  let borrowerAccount: Account | null = Account.load(borrowerId);
  if (borrowerAccount == null) {
    log.error("Borrower Account entity expected to exist when {}'s borrow is liquidated", [borrowerId]);
    return;
  }
  borrowerAccount.countLiquidated = borrowerAccount.countLiquidated + 1;
  borrowerAccount.save();

  let liquidatorId: string = event.params.liquidator.toHexString();
  let liquidatorAccount: Account | null = Account.load(liquidatorId);
  if (liquidatorAccount == null) {
    log.error("Liquidator Account entity expected to exist when {}'s borrow is liquidated by {}", [
      borrowerId,
      liquidatorId,
    ]);
    return;
  }
  liquidatorAccount.countLiquidator = liquidatorAccount.countLiquidator + 1;
  liquidatorAccount.save();

  // We can assume that the FyToken and the Collateral entity exists because bonds
  // have to be listed in the Fintroller before a liquidate borrow can occur.
  let fyTokenId: string = event.address.toHexString();
  let fyToken: FyToken | null = FyToken.load(fyTokenId);
  let collateral: Token | null = Token.load(fyToken.collateral);

  // Create the LiquidateBorrowEvent entity.
  let liquidateBorrowEventId: string = getEventId(event.transaction.hash, event.transactionLogIndex);
  let liquidateBorrowEvent = new LiquidateBorrowEvent(liquidateBorrowEventId);
  liquidateBorrowEvent.amount = event.params.repayAmount.toBigDecimal();
  liquidateBorrowEvent.borrower = Address.fromString(borrowerId);
  liquidateBorrowEvent.blockNumber = event.block.number.toI32();
  liquidateBorrowEvent.collateralSymbol = collateral.symbol;
  liquidateBorrowEvent.clutchedCollateralAmount = event.params.clutchedCollateralAmount.toBigDecimal();
  liquidateBorrowEvent.from = Address.fromString(liquidatorId);
  liquidateBorrowEvent.fyTokenSymbol = fyToken.symbol;
  liquidateBorrowEvent.timestamp = event.block.timestamp.toI32();
  liquidateBorrowEvent.to = Address.fromString(fyTokenId);
  liquidateBorrowEvent.save();
}

export function handleMint(event: Mint): void {
  // We can assume that the FyToken entity exists because bonds have to
  // be listed in the Fintroller before a mint can occur.
  let fyTokenId: string = event.address.toHexString();
  let fyToken: FyToken | null = FyToken.load(fyTokenId);

  // Create the MintEvent entity.
  let mintEventId: string = getEventId(event.transaction.hash, event.transactionLogIndex);
  let mintEvent: MintEvent = new MintEvent(mintEventId);
  mintEvent.amount = event.params.mintAmount.toBigDecimal();
  mintEvent.blockNumber = event.block.number.toI32();
  mintEvent.from = Address.fromString(fyTokenId);
  mintEvent.fyTokenSymbol = fyToken.symbol;
  mintEvent.timestamp = event.block.timestamp.toI32();
  mintEvent.to = event.params.account;
  mintEvent.save();
}

export function handleRepayBorrow(event: RepayBorrow): void {
  let borrowerId: string = event.params.borrower.toHexString();
  let borrowerAccount: Account | null = Account.load(borrowerId);
  if (borrowerAccount == null) {
    log.error("Account entity expected to exist when {}'s borrow is repaid", [borrowerId]);
    return;
  }

  let fyTokenId: string = event.address.toHexString();
  let accountFyTokenId: string = getAccountFyTokenId(fyTokenId, borrowerId);
  let accountFyToken: AccountFyToken | null = AccountFyToken.load(accountFyTokenId);
  if (accountFyToken == null) {
    log.error("AccountFyToken entity expected to exist when repaying borrow for {}", [accountFyTokenId]);
    return;
  }
  let repayAmount: BigDecimal = event.params.repayAmount.toBigDecimal();
  accountFyToken.totalFyTokenRepaid = accountFyToken.totalFyTokenRepaid.plus(repayAmount);
  accountFyToken.save();

  createAccountFyTokenTransaction(fyTokenId, borrowerId, event);

  // We can assume that the FyToken entity exists since bonds have to be
  // listed in the Fintroller before a repay borrow can occur.
  let fyToken: FyToken | null = FyToken.load(fyTokenId);

  // Create the RepayBorrowEvent entity.
  let repayBorrowEventId: string = getEventId(event.transaction.hash, event.transactionLogIndex);
  let repayBorrowEvent: RepayBorrowEvent = new RepayBorrowEvent(repayBorrowEventId);
  repayBorrowEvent.amount = event.params.repayAmount.toBigDecimal();
  repayBorrowEvent.blockNumber = event.block.number.toI32();
  repayBorrowEvent.borrower = Address.fromString(borrowerId);
  repayBorrowEvent.from = event.params.payer;
  repayBorrowEvent.fyTokenSymbol = fyToken.symbol;
  repayBorrowEvent.newDebt = event.params.newDebt.toBigDecimal();
  repayBorrowEvent.timestamp = event.block.timestamp.toI32();
  repayBorrowEvent.to = Address.fromString(fyTokenId);
  repayBorrowEvent.save();
}

export function handleTransfer(event: Transfer): void {
  let fyTokenId: string = event.address.toHexString();

  // Check if the tx is FROM the fyToken contract itself. If so, it is a mint
  // and we don't need to run this code block.
  let fromAccountId: string = event.params.from.toHexString();
  if (fromAccountId != fyTokenId) {
    let account: Account | null = Account.load(fromAccountId);
    if (account == null) {
      log.error("Account entity expected to exist when {} transferred {} tokens", [fromAccountId, fyTokenId]);
      return;
    }

    let accountFyTokenId: string = getAccountFyTokenId(fyTokenId, fromAccountId);
    let accountFyToken: AccountFyToken | null = AccountFyToken.load(accountFyTokenId);
    if (accountFyToken == null) {
      log.error("AccountFyToken entity expected to exist when {} transferred {} tokens", [fromAccountId, fyTokenId]);
      return;
    }
    accountFyToken.fyTokenBalance = accountFyToken.fyTokenBalance.minus(
      event.params.value.toBigDecimal().div(fyTokenDecimalsBd),
    );
    accountFyToken.save();

    createAccountFyTokenTransaction(fyTokenId, fromAccountId, event);
  }

  // Check if the tx is TO the fyToken contract itself. If so, it is a burn
  // and we don't need to run this code block. This leaves an edge case, where
  // someone accidentally sends fTokens to a fyToken contract. This will not
  // get recorded. Right now it would be messy to include, so we are leaving
  // it out for now.
  let toAccountId: string = event.params.to.toHexString();
  if (toAccountId != fyTokenId) {
    loadOrCreateAccount(toAccountId);

    let accountFyToken: AccountFyToken = loadOrCreateAccountFyToken(fyTokenId, toAccountId);
    accountFyToken.fyTokenBalance = accountFyToken.fyTokenBalance.plus(
      event.params.value.toBigDecimal().div(fyTokenDecimalsBd),
    );
    accountFyToken.save();

    createAccountFyTokenTransaction(fyTokenId, toAccountId, event);
  }

  // We can assume that the FyToken entity exists since bonds have to be
  // listed in the Fintroller before a repay borrow can occur.
  let fyToken: FyToken | null = FyToken.load(fyTokenId);

  // Create the FyTokenTransferEvent entity.
  let fyTokenTransferEventId: string = getEventId(event.transaction.hash, event.transactionLogIndex);
  let fyTokenTransferEvent = new FyTokenTransferEvent(fyTokenTransferEventId);
  fyTokenTransferEvent.amount = event.params.value.toBigDecimal();
  fyTokenTransferEvent.from = event.params.from;
  fyTokenTransferEvent.blockNumber = event.block.number.toI32();
  fyTokenTransferEvent.fyTokenSymbol = fyToken.symbol;
  fyTokenTransferEvent.timestamp = event.block.timestamp.toI32();
  fyTokenTransferEvent.to = event.params.to;
  fyTokenTransferEvent.save();
}
