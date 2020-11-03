import { BigInt } from "@graphprotocol/graph-ts";
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
import { Vault } from "../types/schema";

export function handleClutchCollateral(event: ClutchCollateral): void {
  const fyToken: string = event.params.fyToken.toString();
  const borrower: string = event.params.borrower.toString();
  const id: string = fyToken + "-" + borrower;
  let vault: Vault | null = Vault.load(id);
  if (vault == null) {
    log.error("Vault expected to exist when clutching collateral: {}-{}", [fyToken, borrower]);
    return;
  }
  vault.lockedCollateral = vault.lockedCollateral.minus(event.params.clutchedCollateralAmount);
  vault.save();
}

export function handleDepositCollateral(event: DepositCollateral): void {
  const fyToken: string = event.params.fyToken.toString();
  const account: string = event.params.account.toString();
  const id: string = fyToken + "-" + account;
  let vault: Vault | null = Vault.load(id);
  if (vault == null) {
    log.error("Vault expected to exist when depositing collateral: {}-{}", [fyToken, account]);
    return;
  }
  vault.freeCollateral = vault.freeCollateral.plus(event.params.collateralAmount);
  vault.save();
}

export function handleFreeCollateral(event: FreeCollateral): void {
  const fyToken: string = event.params.fyToken.toString();
  const account: string = event.params.account.toString();
  const id: string = fyToken + "-" + account;
  let vault: Vault | null = Vault.load(id);
  if (vault == null) {
    log.error("Vault expected to exist when freeing collateral: {}-{}", [fyToken, account]);
    return;
  }
  vault.freeCollateral = vault.freeCollateral.plus(event.params.collateralAmount);
  vault.lockedCollateral = vault.lockedCollateral.minus(event.params.collateralAmount);
  vault.save();
}

export function handleLockCollateral(event: LockCollateral): void {
  const fyToken: string = event.params.fyToken.toString();
  const account: string = event.params.account.toString();
  const id: string = fyToken + "-" + account;
  let vault: Vault | null = Vault.load(id);
  if (vault == null) {
    log.error("Vault expected to exist when locking collateral: {}-{}", [fyToken, account]);
    return;
  }
  vault.freeCollateral = vault.freeCollateral.minus(event.params.collateralAmount);
  vault.lockedCollateral = vault.lockedCollateral.plus(event.params.collateralAmount);
  vault.save();
}

export function handleOpenVault(event: OpenVault): void {
  const fyToken: string = event.params.fyToken.toString();
  const account: string = event.params.account.toString();
  const id: string = fyToken + "-" + account;
  let vault: Vault | null = Vault.load(id);
  if (vault != null) {
    log.error("Vault expected to be null when opened: {}-{}", [fyToken, account]);
    return;
  }
  vault.debt = BigInt.fromI32(0);
  vault.freeCollateral = BigInt.fromI32(0);
  vault.isOpen = true;
  vault.lockedCollateral = BigInt.fromI32(0);
  vault.save();
}

export function handleSetVaultDebt(event: SetVaultDebt): void {
  const fyToken: string = event.params.fyToken.toString();
  const account: string = event.params.account.toString();
  const id: string = fyToken + "-" + account;
  let vault: Vault | null = Vault.load(id);
  if (vault != null) {
    log.error("Vault expected to be null when opened: {}-{}", [fyToken, account]);
    return;
  }
  vault.debt = event.params.newDebt;
  vault.save();
}

export function handleWithdrawCollateral(event: WithdrawCollateral): void {
  const fyToken: string = event.params.fyToken.toString();
  const account: string = event.params.account.toString();
  const id: string = fyToken + "-" + account;
  let vault: Vault | null = Vault.load(id);
  if (vault == null) {
    log.error("Vault expected to exist when withdrawing collateral: {}-{}", [fyToken, account]);
    return;
  }
  vault.freeCollateral = vault.freeCollateral.minus(event.params.collateralAmount);
  vault.save();
}
