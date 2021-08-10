import {
  Borrow,
  DepositCollateral,
  LiquidateBorrow,
  RepayBorrow,
  SetOracle,
  TransferOwnership,
  WithdrawCollateral,
} from "../types/BalanceSheet/BalanceSheet";
import {
  loadOrCreateCore,
  loadOrCreateToken,
  loadOrCreateTokenBalance,
  loadOrCreateVault,
  normalize,
} from "../helpers";

export function handleBorrow(event: Borrow): void {
  let vault = loadOrCreateVault(event.params.account.toHex(), event.block.timestamp);
  let debts = vault.debts;
  let debt = loadOrCreateTokenBalance(event.params.account, event.params.bond);
  debt.amount = debt.amount.plus(normalize(event.params.borrowAmount, loadOrCreateToken(debt.token).decimals));
  debt.save();
  debts.push(debt.id);
  vault.debts = debts;
  vault.save();
}

export function handleDepositCollateral(event: DepositCollateral): void {
  let core = loadOrCreateCore();
  let vault = loadOrCreateVault(event.params.account.toHex(), event.block.timestamp);
  let collaterals = vault.collaterals;
  let collateral = loadOrCreateTokenBalance(event.params.account, event.params.collateral);
  collateral.amount = collateral.amount.plus(
    normalize(event.params.collateralAmount, loadOrCreateToken(collateral.token).decimals),
  );
  collateral.save();
  collaterals.push(collateral.id);
  vault.collaterals = collaterals;
  vault.save();
  let vaults = core.vaults;
  vaults.push(vault.id);
  core.vaults = vaults;
  core.save();
}

export function handleLiquidateBorrow(event: LiquidateBorrow): void {
  let vault = loadOrCreateVault(event.params.borrower.toHex(), event.block.timestamp);
  let collaterals = vault.collaterals;
  let collateral = loadOrCreateTokenBalance(event.params.borrower, event.params.collateral);
  collateral.amount = collateral.amount.minus(
    normalize(event.params.seizedCollateralAmount, loadOrCreateToken(collateral.token).decimals),
  );
  collateral.save();
  collaterals.push(collateral.id);
  vault.collaterals = collaterals;
  vault.save();
}

export function handleRepayBorrow(event: RepayBorrow): void {
  let vault = loadOrCreateVault(event.params.borrower.toHex(), event.block.timestamp);
  let debts = vault.debts;
  let debt = loadOrCreateTokenBalance(event.params.borrower, event.params.bond);
  debt.amount = debt.amount.minus(normalize(event.params.repayAmount, loadOrCreateToken(debt.token).decimals));
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
  collateral.amount = collateral.amount.minus(
    normalize(event.params.collateralAmount, loadOrCreateToken(collateral.token).decimals),
  );
  collateral.save();
  collaterals.push(collateral.id);
  vault.collaterals = collaterals;
  vault.save();
}
