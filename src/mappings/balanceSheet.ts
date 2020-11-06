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
import { createVault, getAccountFyTokenId, loadOrCreateFintroller, loadOrCreateFyToken } from "../helpers/database";

export function handleClutchCollateral(event: ClutchCollateral): void {
  let borrowerId: string = event.params.borrower.toString();
  let fyTokenId: string = event.params.fyToken.toString();
  let vaultId: string = getAccountFyTokenId(borrowerId, fyTokenId);
  let vault: Vault | null = Vault.load(vaultId);
  if (vault == null) {
    log.error("Vault entity expected to exist when clutching collateral: {}-{}", [fyTokenId, borrowerId]);
    return;
  }
  vault.lockedCollateral = vault.lockedCollateral.minus(event.params.clutchedCollateralAmount.toBigDecimal());
  vault.save();
}

export function handleDepositCollateral(event: DepositCollateral): void {
  let accountId: string = event.params.account.toString();
  let fyTokenId: string = event.params.fyToken.toString();
  let vaultId: string = getAccountFyTokenId(fyTokenId, accountId);
  let vault: Vault | null = Vault.load(vaultId);
  if (vault == null) {
    log.error("Vault entity expected to exist when depositing collateral: {}-{}", [fyTokenId, accountId]);
    return;
  }
  vault.freeCollateral = vault.freeCollateral.plus(event.params.collateralAmount.toBigDecimal());
  vault.save();
}

export function handleFreeCollateral(event: FreeCollateral): void {
  let accountId: string = event.params.account.toString();
  let fyTokenId: string = event.params.fyToken.toString();
  let vaultId: string = getAccountFyTokenId(fyTokenId, accountId);
  let vault: Vault | null = Vault.load(vaultId);
  if (vault == null) {
    log.error("Vault entity expected to exist when freeing collateral: {}-{}", [fyTokenId, accountId]);
    return;
  }
  vault.freeCollateral = vault.freeCollateral.plus(event.params.collateralAmount.toBigDecimal());
  vault.lockedCollateral = vault.lockedCollateral.minus(event.params.collateralAmount.toBigDecimal());
  vault.save();
}

export function handleLockCollateral(event: LockCollateral): void {
  let accountId: string = event.params.account.toString();
  let fyTokenId: string = event.params.fyToken.toString();
  let vaultId: string = getAccountFyTokenId(fyTokenId, accountId);
  let vault: Vault | null = Vault.load(vaultId);
  if (vault == null) {
    log.error("Vault entity expected to exist when locking collateral: {}-{}", [fyTokenId, accountId]);
    return;
  }
  vault.freeCollateral = vault.freeCollateral.minus(event.params.collateralAmount.toBigDecimal());
  vault.lockedCollateral = vault.lockedCollateral.plus(event.params.collateralAmount.toBigDecimal());
  vault.save();
}

export function handleOpenVault(event: OpenVault): void {
  loadOrCreateFintroller();

  let fyTokenId: string = event.params.fyToken.toString();
  loadOrCreateFyToken(fyTokenId);

  let accountId: string = event.params.account.toString();
  let vaultId: string = getAccountFyTokenId(fyTokenId, accountId);
  let vault: Vault | null = Vault.load(vaultId);
  if (vault != null) {
    log.error("Vault entity expected to be null when opened: {}-{}", [fyTokenId, accountId]);
    return;
  }
  createVault(fyTokenId, accountId);
}

export function handleSetVaultDebt(event: SetVaultDebt): void {
  let accountId: string = event.params.account.toString();
  let fyTokenId: string = event.params.fyToken.toString();
  let vaultId: string = getAccountFyTokenId(fyTokenId, accountId);
  let vault: Vault | null = Vault.load(vaultId);
  if (vault == null) {
    log.error("Vault entity expected to exist when the debt is set: {}-{}", [fyTokenId, accountId]);
    return;
  }
  vault.debt = event.params.newDebt.toBigDecimal();
  vault.save();
}

export function handleWithdrawCollateral(event: WithdrawCollateral): void {
  let accountId: string = event.params.account.toString();
  let fyTokenId: string = event.params.fyToken.toString();
  let vaultId: string = getAccountFyTokenId(fyTokenId, accountId);
  let vault: Vault | null = Vault.load(vaultId);
  if (vault == null) {
    log.error("Vault entity expected to exist when withdrawing collateral: {}-{}", [fyTokenId, accountId]);
    return;
  }
  vault.freeCollateral = vault.freeCollateral.minus(event.params.collateralAmount.toBigDecimal());
  vault.save();
}
