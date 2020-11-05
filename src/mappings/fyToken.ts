import { Address } from "@graphprotocol/graph-ts";

import {
  Account,
  AccountFyToken,
  AccountFyTokenTransaction,
  BorrowEvent,
  FyToken,
  LiquidateBorrowEvent,
  MintEvent,
  RepayBorrowEvent,
} from "../types/schema";
import { Borrow, Burn, LiquidateBorrow, Mint, RepayBorrow, Transfer } from "../types/templates/FyToken/FyToken";
import { createAccountFyTokenTransaction, loadOrCreateAccount, loadOrCreateAccountFyToken } from "../helpers/database";

export function handleBorrow(event: Borrow): void {
  // We can assume that the FyToken entity exists since bonds have to be
  // listed in the Fintroller before a borrow can occur.
  const fyTokenAddress: string = event.address.toString();
  let fyToken: FyToken = FyToken.load(fyTokenAddress);

  const borrower: string = event.params.account.toString();
  let accountFyToken: AccountFyToken = loadOrCreateAccountFyToken(fyTokenAddress, borrower);
  accountFyToken.save();

  let transaction: AccountFyTokenTransaction = createAccountFyTokenTransaction(borrower, event);
  transaction.save();

  const borrowEventId: string = event.transaction.hash
    .toString()
    .concat("-")
    .concat(event.transactionLogIndex.toString());
  let borrowEvent: BorrowEvent = new BorrowEvent(borrowEventId);
  // TODO: fix this typo in Solidity
  borrowEvent.amount = event.params.repayAmount.toBigDecimal();
  borrowEvent.borrower = event.params.account;
  borrowEvent.blockNumber = event.block.number.toI32();
  borrowEvent.fyTokenSymbol = fyToken.symbol;
  borrowEvent.timestamp = event.block.timestamp.toI32();
  borrowEvent.save();
}

export function handleBurn(event: Burn): void {
  // We can assume that the FyToken entity exists because bonds have to
  // be listed in the Fintroller before a burn can occur.
  const fyTokenAddress: Address = event.address;
  let fyToken: FyToken = FyToken.load(fyTokenAddress.toString());

  const burnEventId: string = event.transaction.hash
    .toString()
    .concat("-")
    .concat(event.transactionLogIndex.toString());
  let burnEvent: MintEvent = new MintEvent(burnEventId);
  burnEvent.amount = event.params.burnAmount.toBigDecimal();
  burnEvent.blockNumber = event.block.number.toI32();
  burnEvent.from = event.params.account;
  burnEvent.fyTokenSymbol = fyToken.symbol;
  burnEvent.timestamp = event.block.timestamp.toI32();
  burnEvent.to = fyTokenAddress;
  burnEvent.save();
}

export function handleLiquidateBorrow(event: LiquidateBorrow): void {
  let borrowerAccount: Account = loadOrCreateAccount(event.params.borrower.toString());
  borrowerAccount.countLiquidated = borrowerAccount.countLiquidated + 1;
  borrowerAccount.save();

  let liquidatorAccount: Account = loadOrCreateAccount(event.params.liquidator.toString());
  liquidatorAccount.countLiquidator = liquidatorAccount.countLiquidator + 1;
  liquidatorAccount.save();

  // We can assume that the FyToken entity exists because bonds have to
  // be listed in the Fintroller before a mint can occur.
  const fyTokenAddress: Address = event.address;
  let fyToken: FyToken = FyToken.load(fyTokenAddress.toString());

  const liquidateBorrowEventId = event.transaction.hash
    .toString()
    .concat("-")
    .concat(event.transactionLogIndex.toString());
  let liquidateBorrowEvent = new LiquidateBorrowEvent(liquidateBorrowEventId);
  liquidateBorrowEvent.amount = event.params.repayAmount.toBigDecimal();
  liquidateBorrowEvent.blockNumber = event.block.number.toI32();
  liquidateBorrowEvent.clutchedCollateralAmount = event.params.clutchedCollateralAmount.toBigDecimal();
  liquidateBorrowEvent.from = event.params.borrower;
  liquidateBorrowEvent.fyTokenSymbol = fyToken.symbol;
  liquidateBorrowEvent.timestamp = event.block.timestamp.toI32();
  liquidateBorrowEvent.to = event.params.liquidator;
  liquidateBorrowEvent.save();
}

export function handleMint(event: Mint): void {
  // We can assume that the FyToken entity exists because bonds have to
  // be listed in the Fintroller before a mint can occur.
  const fyTokenAddress: Address = event.address;
  let fyToken: FyToken = FyToken.load(fyTokenAddress.toString());

  const mintEventId: string = event.transaction.hash
    .toString()
    .concat("-")
    .concat(event.transactionLogIndex.toString());
  let mintEvent: MintEvent = new MintEvent(mintEventId);
  mintEvent.amount = event.params.mintAmount.toBigDecimal();
  mintEvent.blockNumber = event.block.number.toI32();
  mintEvent.from = fyTokenAddress;
  mintEvent.fyTokenSymbol = fyToken.symbol;
  mintEvent.timestamp = event.block.timestamp.toI32();
  mintEvent.to = event.params.account;
  mintEvent.save();
}

export function handleRepayBorrow(event: RepayBorrow): void {
  // We can assume that the FyToken entity exists since bonds have to be
  // listed in the Fintroller before a borrow can occur.
  const fyTokenAddress: string = event.address.toString();
  let fyToken: FyToken = FyToken.load(fyTokenAddress);

  const repayBorrowEventId: string = event.transaction.hash
    .toString()
    .concat("-")
    .concat(event.transactionLogIndex.toString());
  let repayBorrowEvent: RepayBorrowEvent = new RepayBorrowEvent(repayBorrowEventId);
  repayBorrowEvent.borrower = event.params.borrower;
  repayBorrowEvent.blockNumber = event.block.number.toI32();
  repayBorrowEvent.fyTokenSymbol = fyToken.symbol;
  repayBorrowEvent.payer = event.params.payer;
  repayBorrowEvent.repayAmount = event.params.repayAmount.toBigDecimal();
  repayBorrowEvent.timestamp = event.block.timestamp.toI32();
  repayBorrowEvent.save();
}
