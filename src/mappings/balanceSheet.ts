import { BigDecimal, log } from "@graphprotocol/graph-ts";

import {
  ClutchCollateral,
  DepositCollateral,
  FreeCollateral,
  LockCollateral,
  OpenVault,
  SetVaultDebt,
  WithdrawCollateral,
} from "../types/BalanceSheet/BalanceSheet";
import { FyToken, Token, Vault } from "../types/schema";
import { createVault, getAccountFyTokenId, loadOrCreateFintroller, loadOrCreateFyToken } from "../helpers/database";
import { fyTokenDecimalsBd } from "../helpers/constants";
import { scaleTokenAmount } from "../helpers/math";

export function handleClutchCollateral(event: ClutchCollateral): void {
  let fyTokenId: string = event.params.fyToken.toHexString();
  let borrowerId: string = event.params.borrower.toHexString();

  let vaultId: string = getAccountFyTokenId(borrowerId, fyTokenId);
  let vault: Vault | null = Vault.load(vaultId);
  if (vault == null) {
    log.error("Vault entity expected to exist when clutching collateral: {}-{}", [fyTokenId, borrowerId]);
    return;
  }

  let fyToken: FyToken | null = FyToken.load(fyTokenId);
  let collateralId: string = fyToken.collateral;
  let collateral: Token | null = Token.load(collateralId);
  let clutchedCollateralAmountBd: BigDecimal = scaleTokenAmount(
    event.params.clutchedCollateralAmount,
    collateral.decimals,
  );
  vault.lockedCollateral = vault.lockedCollateral.minus(clutchedCollateralAmountBd);
  vault.save();
}

export function handleDepositCollateral(event: DepositCollateral): void {
  let fyTokenId: string = event.params.fyToken.toHexString();
  let accountId: string = event.params.account.toHexString();

  let vaultId: string = getAccountFyTokenId(fyTokenId, accountId);
  let vault: Vault | null = Vault.load(vaultId);
  if (vault == null) {
    log.error("Vault entity expected to exist when depositing collateral: {}-{}", [fyTokenId, accountId]);
    return;
  }

  let fyToken: FyToken | null = FyToken.load(fyTokenId);
  let collateralId: string = fyToken.collateral;
  let collateral: Token | null = Token.load(collateralId);
  let collateralAmountBd: BigDecimal = scaleTokenAmount(event.params.collateralAmount, collateral.decimals);
  vault.freeCollateral = vault.freeCollateral.plus(collateralAmountBd);
  vault.save();
}

export function handleFreeCollateral(event: FreeCollateral): void {
  let fyTokenId: string = event.params.fyToken.toHexString();
  let accountId: string = event.params.account.toHexString();

  let vaultId: string = getAccountFyTokenId(fyTokenId, accountId);
  let vault: Vault | null = Vault.load(vaultId);
  if (vault == null) {
    log.error("Vault entity expected to exist when freeing collateral: {}-{}", [fyTokenId, accountId]);
    return;
  }

  let fyToken: FyToken | null = FyToken.load(fyTokenId);
  let collateralId: string = fyToken.collateral;
  let collateral: Token | null = Token.load(collateralId);
  let collateralAmountBd: BigDecimal = scaleTokenAmount(event.params.collateralAmount, collateral.decimals);
  vault.freeCollateral = vault.freeCollateral.plus(collateralAmountBd);
  vault.lockedCollateral = vault.lockedCollateral.minus(collateralAmountBd);
  vault.save();
}

export function handleLockCollateral(event: LockCollateral): void {
  let fyTokenId: string = event.params.fyToken.toHexString();
  let accountId: string = event.params.account.toHexString();

  let vaultId: string = getAccountFyTokenId(fyTokenId, accountId);
  let vault: Vault | null = Vault.load(vaultId);
  if (vault == null) {
    log.error("Vault entity expected to exist when locking collateral: {}-{}", [fyTokenId, accountId]);
    return;
  }

  let fyToken: FyToken | null = FyToken.load(fyTokenId);
  let collateralId: string = fyToken.collateral;
  let collateral: Token | null = Token.load(collateralId);
  let collateralAmountBd: BigDecimal = scaleTokenAmount(event.params.collateralAmount, collateral.decimals);
  vault.freeCollateral = vault.freeCollateral.minus(collateralAmountBd);
  vault.lockedCollateral = vault.lockedCollateral.plus(collateralAmountBd);
  vault.save();
}

export function handleOpenVault(event: OpenVault): void {
  loadOrCreateFintroller();

  let fyTokenId: string = event.params.fyToken.toHexString();
  loadOrCreateFyToken(fyTokenId);

  let accountId: string = event.params.account.toHexString();
  let vaultId: string = getAccountFyTokenId(fyTokenId, accountId);
  let vault: Vault | null = Vault.load(vaultId);
  if (vault != null) {
    log.error("Vault entity expected to be null when opened: {}-{}", [fyTokenId, accountId]);
    return;
  }
  createVault(fyTokenId, accountId);
}

export function handleSetVaultDebt(event: SetVaultDebt): void {
  let fyTokenId: string = event.params.fyToken.toHexString();
  let accountId: string = event.params.account.toHexString();

  let vaultId: string = getAccountFyTokenId(fyTokenId, accountId);
  let vault: Vault | null = Vault.load(vaultId);
  if (vault == null) {
    log.error("Vault entity expected to exist when the debt is set: {}-{}", [fyTokenId, accountId]);
    return;
  }

  let newDebtBd: BigDecimal = event.params.newDebt.toBigDecimal().div(fyTokenDecimalsBd);
  vault.debt = newDebtBd;
  vault.save();
}

export function handleWithdrawCollateral(event: WithdrawCollateral): void {
  let fyTokenId: string = event.params.fyToken.toHexString();
  let accountId: string = event.params.account.toHexString();

  let vaultId: string = getAccountFyTokenId(fyTokenId, accountId);
  let vault: Vault | null = Vault.load(vaultId);
  if (vault == null) {
    log.error("Vault entity expected to exist when withdrawing collateral: {}-{}", [fyTokenId, accountId]);
    return;
  }

  let fyToken: FyToken | null = FyToken.load(fyTokenId);
  let collateralId: string = fyToken.collateral;
  let collateral: Token | null = Token.load(collateralId);
  let collateralAmountBd: BigDecimal = scaleTokenAmount(event.params.collateralAmount, collateral.decimals);
  vault.freeCollateral = vault.freeCollateral.minus(collateralAmountBd);
  vault.save();
}
