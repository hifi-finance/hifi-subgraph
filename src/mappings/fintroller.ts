import {
  Fintroller,
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
} from "../types/Fintroller/Fintroller";

import { loadOrCreateCore } from "../helpers";

export function handleListBond(event: ListBond): void {
  let core = loadOrCreateCore();
  let listedBonds = core.listedBonds;
  listedBonds.push(event.params.bond);
  core.listedBonds = listedBonds;
  core.save();
}

export function handleListCollateral(event: ListCollateral): void {
  let core = loadOrCreateCore();
  let listedCollaterals = core.listedCollaterals;
  listedCollaterals.push(event.params.collateral);
  core.listedCollaterals = listedCollaterals;
  core.save();
}

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
