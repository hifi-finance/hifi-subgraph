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
  let position = loadOrCreatePosition(event.params.account, event.params.bond);
  let bond = loadOrCreateToken(position.token);
  position.amount = position.amount.plus(scaleTokenAmount(event.params.borrowAmount, bond.decimals));
  position.save();
  debts.push(position.id);
  vault.debts = debts;
  vault.save();
}

export function handleDepositCollateral(event: DepositCollateral): void {
  let hifi = loadOrCreateHifi();
  let vault = loadOrCreateVault(event.params.account.toHex(), event.block.timestamp);
  let collaterals = vault.collaterals;
  let position = loadOrCreatePosition(event.params.account, event.params.collateral);
  let collateral = loadOrCreateToken(position.token);
  position.amount = position.amount.plus(scaleTokenAmount(event.params.collateralAmount, collateral.decimals));
  position.save();
  collaterals.push(position.id);
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
  let position = loadOrCreatePosition(event.params.borrower, event.params.collateral);
  let collateral = loadOrCreateToken(position.token);
  position.amount = position.amount.minus(scaleTokenAmount(event.params.seizedCollateralAmount, collateral.decimals));
  position.save();
  collaterals.push(position.id);
  vault.collaterals = collaterals;
  vault.save();
}

export function handleRepayBorrow(event: RepayBorrow): void {
  let vault = loadOrCreateVault(event.params.borrower.toHex(), event.block.timestamp);
  let debts = vault.debts;
  let position = loadOrCreatePosition(event.params.borrower, event.params.bond);
  let bond = loadOrCreateToken(position.token);
  position.amount = position.amount.minus(scaleTokenAmount(event.params.repayAmount, bond.decimals));
  position.save();
  debts.push(position.id);
  vault.debts = debts;
  vault.save();
}

export function handleWithdrawCollateral(event: WithdrawCollateral): void {
  let vault = loadOrCreateVault(event.params.account.toHex(), event.block.timestamp);
  let collaterals = vault.collaterals;
  let position = loadOrCreatePosition(event.params.account, event.params.collateral);
  let collateral = loadOrCreateToken(position.token);
  position.amount = position.amount.minus(scaleTokenAmount(event.params.collateralAmount, collateral.decimals));
  position.save();
  collaterals.push(position.id);
  vault.collaterals = collaterals;
  vault.save();
}
