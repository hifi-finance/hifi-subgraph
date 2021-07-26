import {} from "../types/schema";

import {
  FintrollerV1,
  ListBond,
  ListCollateral,
  SetBorrowAllowed,
  SetCollateralizationRatio,
  SetDebtCeiling,
  SetDepositCollateralAllowed,
  SetLiquidateBorrowAllowed,
  SetLiquidationIncentive,
  SetMaxBonds,
  SetRedeemHTokensAllowed,
  SetRepayBorrowAllowed,
  SetSupplyUnderlyingAllowed,
  TransferOwnership,
} from "../types/FintrollerV1/FintrollerV1";

import { BigInt } from "@graphprotocol/graph-ts";

export function handleListBond(event: ListBond): void {}

export function handleListCollateral(event: ListCollateral): void {}

export function handleSetBorrowAllowed(event: SetBorrowAllowed): void {}

export function handleSetCollateralizationRatio(event: SetCollateralizationRatio): void {}

export function handleSetDebtCeiling(event: SetDebtCeiling): void {}

export function handleSetDepositCollateralAllowed(event: SetDepositCollateralAllowed): void {}

export function handleSetLiquidateBorrowAllowed(event: SetLiquidateBorrowAllowed): void {}

export function handleSetLiquidationIncentive(event: SetLiquidationIncentive): void {}

export function handleSetMaxBonds(event: SetMaxBonds): void {}

export function handleSetRedeemHTokensAllowed(event: SetRedeemHTokensAllowed): void {}

export function handleSetRepayBorrowAllowed(event: SetRepayBorrowAllowed): void {}

export function handleSetSupplyUnderlyingAllowed(event: SetSupplyUnderlyingAllowed): void {}

export function handleTransferOwnership(event: TransferOwnership): void {}
