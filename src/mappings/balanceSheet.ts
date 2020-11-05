import { log } from "@graphprotocol/graph-ts";

import {
  ClutchCollateral,
  DepositCollateral,
  FreeCollateral,
  LockCollateral,
  OpenVault,
  SetVaultDebt,
  WithdrawCollateral,
} from "../types/BalanceSheet/BalanceSheet";
import { Fintroller, FyToken, Vault } from "../types/schema";
import { createVault, loadOrCreateFintroller, loadOrCreateFyToken } from "../helpers/database";

export function handleClutchCollateral(event: ClutchCollateral): void {
  const borrower: string = event.params.borrower.toString();
  const fyTokenAddress: string = event.params.fyToken.toString();
  const id: string = borrower.concat("-").concat(fyTokenAddress);
  let vault: Vault | null = Vault.load(id);
  if (vault == null) {
    log.error("Vault entity expected to exist when clutching collateral: {}-{}", [fyTokenAddress, borrower]);
    return;
  }
  vault.lockedCollateral = vault.lockedCollateral.minus(event.params.clutchedCollateralAmount);
  vault.save();
}

export function handleDepositCollateral(event: DepositCollateral): void {
  const account: string = event.params.account.toString();
  const fyTokenAddress: string = event.params.fyToken.toString();
  const id: string = fyTokenAddress.concat("-").concat(account);
  let vault: Vault | null = Vault.load(id);
  if (vault == null) {
    log.error("Vault entity expected to exist when depositing collateral: {}-{}", [fyTokenAddress, account]);
    return;
  }
  vault.freeCollateral = vault.freeCollateral.plus(event.params.collateralAmount);
  vault.save();
}

export function handleFreeCollateral(event: FreeCollateral): void {
  const account: string = event.params.account.toString();
  const fyTokenAddress: string = event.params.fyToken.toString();
  const id: string = fyTokenAddress.concat("-").concat(account);
  let vault: Vault | null = Vault.load(id);
  if (vault == null) {
    log.error("Vault entity expected to exist when freeing collateral: {}-{}", [fyTokenAddress, account]);
    return;
  }
  vault.freeCollateral = vault.freeCollateral.plus(event.params.collateralAmount);
  vault.lockedCollateral = vault.lockedCollateral.minus(event.params.collateralAmount);
  vault.save();
}

export function handleLockCollateral(event: LockCollateral): void {
  const account: string = event.params.account.toString();
  const fyTokenAddress: string = event.params.fyToken.toString();
  const id: string = fyTokenAddress.concat("-").concat(account);
  let vault: Vault | null = Vault.load(id);
  if (vault == null) {
    log.error("Vault entity expected to exist when locking collateral: {}-{}", [fyTokenAddress, account]);
    return;
  }
  vault.freeCollateral = vault.freeCollateral.minus(event.params.collateralAmount);
  vault.lockedCollateral = vault.lockedCollateral.plus(event.params.collateralAmount);
  vault.save();
}

export function handleOpenVault(event: OpenVault): void {
  let fintroller: Fintroller = loadOrCreateFintroller();
  fintroller.save();

  const fyTokenAddress: string = event.params.fyToken.toString();
  let fyToken: FyToken = loadOrCreateFyToken(fyTokenAddress);
  fyToken.save();

  const account: string = event.params.account.toString();
  const id: string = fyTokenAddress.concat("-").concat(account);
  let vault: Vault | null = Vault.load(id);
  if (vault != null) {
    log.error("Vault entity expected to be null when opened: {}-{}", [fyTokenAddress, account]);
    return;
  }
  vault = createVault(fyTokenAddress, account);
  vault.save();
}

export function handleSetVaultDebt(event: SetVaultDebt): void {
  const account: string = event.params.account.toString();
  const fyTokenAddress: string = event.params.fyToken.toString();
  const id: string = fyTokenAddress.concat("-").concat(account);
  let vault: Vault | null = Vault.load(id);
  if (vault == null) {
    log.error("Vault entity expected to exist when the debt is set: {}-{}", [fyTokenAddress, account]);
    return;
  }
  vault.debt = event.params.newDebt;
  vault.save();
}

export function handleWithdrawCollateral(event: WithdrawCollateral): void {
  const account: string = event.params.account.toString();
  const fyTokenAddress: string = event.params.fyToken.toString();
  const id: string = fyTokenAddress.concat("-").concat(account);
  let vault: Vault | null = Vault.load(id);
  if (vault == null) {
    log.error("Vault entity expected to exist when withdrawing collateral: {}-{}", [fyTokenAddress, account]);
    return;
  }
  vault.freeCollateral = vault.freeCollateral.minus(event.params.collateralAmount);
  vault.save();
}
