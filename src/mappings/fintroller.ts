import {
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
import { loadOrCreateCore, loadOrCreatePool } from "../helpers";

export function handleListBond(event: ListBond): void {
  // // TODO: delete line below once HifiPoolRegistry is integrated
  // loadOrCreatePool("0x378cC4985f5507Eb605Ed29a2C4167c4cf2215F3");
  let core = loadOrCreateCore();
  let listedBonds = core.listedBonds;
  listedBonds.push(event.params.bond);
  core.listedBonds = listedBonds;
  core.save();
}

export function handleListCollateral(event: ListCollateral): void {
  // // TODO: delete line below once HifiPoolRegistry is integrated
  // loadOrCreatePool("0x378cC4985f5507Eb605Ed29a2C4167c4cf2215F3");
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
