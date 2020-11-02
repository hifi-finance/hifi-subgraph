import { BigInt } from "@graphprotocol/graph-ts";

import { OpenVault } from "../types/BalanceSheet/BalanceSheet";
import { Vault } from "../types/schema";

export function handleClutchCollateral(): void {}

export function handleDepositCollateral(): void {}

export function handleFreeCollateral(): void {}

export function handleLockCollateral(): void {}

export function handleOpenVault(event: OpenVault): void {
  let account = event.params.account.toString();
  let vault: Vault | null = Vault.load(account);
  if (vault == null) {
    vault = new Vault(account);
    vault.debt = BigInt.fromI32(0);
    vault.isOpen = true;
    vault.save();
  }
}

export function handleWithdrawCollateral(): void {}
