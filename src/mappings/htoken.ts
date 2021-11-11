import {} from "../types/schema";

import {
  Approval,
  Burn,
  HToken,
  Mint,
  Recover,
  Redeem,
  SetBalanceSheet,
  SetNonRecoverableTokens,
  SupplyUnderlying,
  Transfer,
  TransferOwnership,
} from "../types/templates/HToken/HToken";

export function handleApproval(event: Approval): void {}

export function handleBurn(event: Burn): void {}

export function handleMint(event: Mint): void {}

export function handleRecover(event: Recover): void {}

export function handleRedeem(event: Redeem): void {}

export function handleSetBalanceSheet(event: SetBalanceSheet): void {}

export function handleSetNonRecoverableTokens(event: SetNonRecoverableTokens): void {}

export function handleSupplyUnderlying(event: SupplyUnderlying): void {}

export function handleTransfer(event: Transfer): void {}

export function handleTransferOwnership(event: TransferOwnership): void {}
