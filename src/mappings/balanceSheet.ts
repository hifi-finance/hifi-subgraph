import { BigDecimal, BigInt, log, store } from "@graphprotocol/graph-ts";

import {
  getAccountTokenId,
  loadOrCreateHifi,
  loadOrCreatePosition,
  loadOrCreateVault,
  scaleTokenAmount,
  zeroBd,
} from "../helpers";
import {
  Borrow,
  DepositCollateral,
  LiquidateBorrow,
  RepayBorrow,
  WithdrawCollateral,
} from "../types/BalanceSheet/BalanceSheet";
import { Hifi, Position, Token, Vault } from "../types/schema";

export function handleBorrow(event: Borrow): void {
  let bondId: string = event.params.bond.toHexString();
  let bond: Token | null = Token.load(bondId);
  if (bond == null) {
    log.critical("Token entity of id {} expected to exist when borrowing", [bondId]);
    return;
  }

  let position: Position = loadOrCreatePosition(event.params.account, event.params.bond);
  let borrowAmount: BigInt = event.params.borrowAmount;
  let borrowAmountBd: BigDecimal = scaleTokenAmount(borrowAmount, bond.decimals);
  position.amount = position.amount.plus(borrowAmountBd);
  position.save();

  let accountId: string = event.params.account.toHexString();
  let vault: Vault = loadOrCreateVault(accountId, event.block.timestamp);
  let debts: string[] = vault.debts;
  debts.push(position.id);
  vault.debts = debts;
  vault.save();
}

export function handleDepositCollateral(event: DepositCollateral): void {
  let collateralId: string = event.params.collateral.toHexString();
  let collateral: Token | null = Token.load(collateralId);
  if (collateral == null) {
    log.critical("Token entity of id {} expected to exist when depositing collateral", [collateralId]);
    return;
  }

  let position: Position = loadOrCreatePosition(event.params.account, event.params.collateral);
  let collateralAmount: BigInt = event.params.collateralAmount;
  let collateralAmountBd: BigDecimal = scaleTokenAmount(collateralAmount, collateral.decimals);
  position.amount = position.amount.plus(collateralAmountBd);
  position.save();

  let accountId: string = event.params.account.toHexString();
  let vault: Vault = loadOrCreateVault(accountId, event.block.timestamp);
  let collaterals: string[] = vault.collaterals;
  collaterals.push(position.id);
  vault.collaterals = collaterals;
  vault.save();

  let hifi: Hifi = loadOrCreateHifi();
  let vaults: string[] = hifi.vaults;
  vaults.push(vault.id);
  hifi.vaults = vaults;
  hifi.save();
}

export function handleLiquidateBorrow(event: LiquidateBorrow): void {
  let collateralId: string = event.params.collateral.toHexString();
  let collateral: Token | null = Token.load(collateralId);
  if (collateral == null) {
    log.critical("Token entity of id {} expected to exist when liquidating borrow", [collateralId]);
    return;
  }

  let borrowerId: string = event.params.borrower.toHexString();
  let positionId: string = getAccountTokenId(borrowerId, collateralId);
  let position: Position | null = Position.load(positionId);
  if (position == null) {
    log.critical("Position entity of id {} expected to exist when liquidating borrow", [positionId]);
    return;
  }

  let seizedCollateralAmount: BigInt = event.params.seizedCollateralAmount;
  let seizedCollateralAmountBd: BigDecimal = scaleTokenAmount(seizedCollateralAmount, collateral.decimals);
  position.amount = position.amount.minus(seizedCollateralAmountBd);
  position.save();

  if (position.amount.equals(zeroBd)) {
    store.remove("Position", positionId);
  }
}

export function handleRepayBorrow(event: RepayBorrow): void {
  let bondId: string = event.params.bond.toHexString();
  let bond: Token | null = Token.load(bondId);
  if (bond == null) {
    log.critical("Token entity of id {} expected to exist when repaying borrow", [bondId]);
    return;
  }

  let borrowerId: string = event.params.borrower.toHexString();
  let positionId: string = getAccountTokenId(borrowerId, bondId);
  let position: Position | null = Position.load(positionId);
  if (position == null) {
    log.critical("Position entity of id {} expected to exist when repaying borrow", [positionId]);
    return;
  }

  let repayAmount: BigInt = event.params.repayAmount;
  let repayAmountBd: BigDecimal = scaleTokenAmount(repayAmount, bond.decimals);
  position.amount = position.amount.minus(repayAmountBd);
  position.save();

  if (position.amount.equals(zeroBd)) {
    store.remove("Position", positionId);
  }
}

export function handleWithdrawCollateral(event: WithdrawCollateral): void {
  let collateralId: string = event.params.collateral.toHexString();
  let collateral: Token | null = Token.load(collateralId);
  if (collateral == null) {
    log.critical("Token entity of id {} expected to exist when withdrawing collateral", [collateralId]);
    return;
  }

  let accountId: string = event.params.account.toHexString();
  let positionId: string = getAccountTokenId(accountId, collateralId);
  let position: Position | null = Position.load(positionId);
  if (position == null) {
    log.critical("Position entity of id {} expected to exist when withdrawing collateral", [positionId]);
    return;
  }

  let collateralAmount: BigInt = event.params.collateralAmount;
  let collateralAmountBd: BigDecimal = scaleTokenAmount(collateralAmount, collateral.decimals);
  position.amount = position.amount.minus(collateralAmountBd);
  position.save();

  if (position.amount.equals(zeroBd)) {
    store.remove("Position", positionId);
  }
}
