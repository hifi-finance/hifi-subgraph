import {
  loadOrCreateHifi,
  loadOrCreatePosition,
  loadOrCreateToken,
  loadOrCreateVault,
  scaleTokenAmount,
} from "../helpers";
import {
  Borrow,
  DepositCollateral,
  LiquidateBorrow,
  RepayBorrow,
  WithdrawCollateral,
} from "../types/BalanceSheet/BalanceSheet";

export function handleBorrow(event: Borrow): void {
  let vault = loadOrCreateVault(event.params.account.toHex(), event.block.timestamp);
  let debts = vault.debts;
  let debt = loadOrCreatePosition(event.params.account, event.params.bond);
  debt.amount = debt.amount.plus(scaleTokenAmount(event.params.borrowAmount, loadOrCreateToken(debt.token).decimals));
  debt.save();
  debts.push(debt.id);
  vault.debts = debts;
  vault.save();
}

export function handleDepositCollateral(event: DepositCollateral): void {
  let hifi = loadOrCreateHifi();
  let vault = loadOrCreateVault(event.params.account.toHex(), event.block.timestamp);
  let collaterals = vault.collaterals;
  let collateral = loadOrCreatePosition(event.params.account, event.params.collateral);
  collateral.amount = collateral.amount.plus(
    scaleTokenAmount(event.params.collateralAmount, loadOrCreateToken(collateral.token).decimals),
  );
  collateral.save();
  collaterals.push(collateral.id);
  vault.collaterals = collaterals;
  vault.save();
  let vaults = hifi.vaults;
  vaults.push(vault.id);
  hifi.vaults = vaults;
  hifi.save();
}

export function handleLiquidateBorrow(event: LiquidateBorrow): void {
  let vault = loadOrCreateVault(event.params.borrower.toHex(), event.block.timestamp);
  let collaterals = vault.collaterals;
  let collateral = loadOrCreatePosition(event.params.borrower, event.params.collateral);
  collateral.amount = collateral.amount.minus(
    scaleTokenAmount(event.params.seizedCollateralAmount, loadOrCreateToken(collateral.token).decimals),
  );
  collateral.save();
  collaterals.push(collateral.id);
  vault.collaterals = collaterals;
  vault.save();
}

export function handleRepayBorrow(event: RepayBorrow): void {
  let vault = loadOrCreateVault(event.params.borrower.toHex(), event.block.timestamp);
  let debts = vault.debts;
  let debt = loadOrCreatePosition(event.params.borrower, event.params.bond);
  debt.amount = debt.amount.minus(scaleTokenAmount(event.params.repayAmount, loadOrCreateToken(debt.token).decimals));
  debt.save();
  debts.push(debt.id);
  vault.debts = debts;
  vault.save();
}

export function handleWithdrawCollateral(event: WithdrawCollateral): void {
  let vault = loadOrCreateVault(event.params.account.toHex(), event.block.timestamp);
  let collaterals = vault.collaterals;
  let collateral = loadOrCreatePosition(event.params.account, event.params.collateral);
  collateral.amount = collateral.amount.minus(
    scaleTokenAmount(event.params.collateralAmount, loadOrCreateToken(collateral.token).decimals),
  );
  collateral.save();
  collaterals.push(collateral.id);
  vault.collaterals = collaterals;
  vault.save();
}
