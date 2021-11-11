import { loadOrCreateHifi } from "../helpers";
import { ListBond, ListCollateral } from "../types/Fintroller/Fintroller";

export function handleListBond(event: ListBond): void {
  let hifi = loadOrCreateHifi();
  let listedBonds = hifi.listedBonds;
  listedBonds.push(event.params.bond);
  hifi.listedBonds = listedBonds;
  hifi.save();
}

export function handleListCollateral(event: ListCollateral): void {
  let hifi = loadOrCreateHifi();
  let listedCollaterals = hifi.listedCollaterals;
  listedCollaterals.push(event.params.collateral);
  hifi.listedCollaterals = listedCollaterals;
  hifi.save();
}

// export function handleSetBorrowAllowed(event: SetBorrowAllowed): void {}

// export function handleSetCollateralCeiling(event: SetCollateralCeiling): void {}

// export function handleSetDebtCeiling(event: SetDebtCeiling): void {}

// export function handleSetDepositCollateralAllowed(event: SetDepositCollateralAllowed): void {}

// export function handleSetLiquidateBorrowAllowed(event: SetLiquidateBorrowAllowed): void {}

// export function handleSetLiquidationIncentive(event: SetLiquidationIncentive): void {}

// export function handleSetMaxBonds(event: SetMaxBonds): void {}

// export function handleSetRedeemHTokensAllowed(event: SetRedeemHTokensAllowed): void {}

// export function handleSetRepayBorrowAllowed(event: SetRepayBorrowAllowed): void {}

// export function handleSetSupplyUnderlyingAllowed(event: SetSupplyUnderlyingAllowed): void {}

// export function handleTransferOwnership(event: TransferOwnership): void {}
