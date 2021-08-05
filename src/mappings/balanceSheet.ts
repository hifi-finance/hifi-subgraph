import {
  Borrow,
  DepositCollateral,
  LiquidateBorrow,
  RepayBorrow,
  SetOracle,
  TransferOwnership,
  WithdrawCollateral,
} from "../types/BalanceSheet/BalanceSheet";
import { loadOrCreateTokenBalance, loadOrCreateVault } from "../helpers";

export function handleBorrow(event: Borrow): void {
  let vault = loadOrCreateVault(event.params.account.toHex(), event.block.timestamp);
  let debts = vault.debts;
  let debt = loadOrCreateTokenBalance(event.params.account, event.params.bond);
  debt.amount = debt.amount.plus(event.params.borrowAmount);
  debt.save();
  debts.push(debt.id);
  vault.debts = debts;
  vault.save();
}

export function handleDepositCollateral(event: DepositCollateral): void {
  let vault = loadOrCreateVault(event.params.account.toHex(), event.block.timestamp);
  let collaterals = vault.collaterals;
  let collateral = loadOrCreateTokenBalance(event.params.account, event.params.collateral);
  collateral.amount = collateral.amount.plus(event.params.collateralAmount);
  collateral.save();
  collaterals.push(collateral.id);
  vault.collaterals = collaterals;
  vault.save();
}

export function handleLiquidateBorrow(event: LiquidateBorrow): void {
  let vault = loadOrCreateVault(event.params.borrower.toHex(), event.block.timestamp);
  let collaterals = vault.collaterals;
  let collateral = loadOrCreateTokenBalance(event.params.borrower, event.params.collateral);
  collateral.amount = collateral.amount.minus(event.params.seizedCollateralAmount);
  collateral.save();
  collaterals.push(collateral.id);
  vault.collaterals = collaterals;
  vault.save();
}

export function handleRepayBorrow(event: RepayBorrow): void {
  let vault = loadOrCreateVault(event.params.borrower.toHex(), event.block.timestamp);
  let debts = vault.debts;
  let debt = loadOrCreateTokenBalance(event.params.borrower, event.params.bond);
  debt.amount = debt.amount.minus(event.params.repayAmount);
  debt.save();
  debts.push(debt.id);
  vault.debts = debts;
  vault.save();
}

export function handleSetOracle(event: SetOracle): void {}

export function handleTransferOwnership(event: TransferOwnership): void {}

export function handleWithdrawCollateral(event: WithdrawCollateral): void {
  let vault = loadOrCreateVault(event.params.account.toHex(), event.block.timestamp);
  let collaterals = vault.collaterals;
  let collateral = loadOrCreateTokenBalance(event.params.account, event.params.collateral);
  collateral.amount = collateral.amount.minus(event.params.collateralAmount);
  collateral.save();
  collaterals.push(collateral.id);
  vault.collaterals = collaterals;
  vault.save();
}
