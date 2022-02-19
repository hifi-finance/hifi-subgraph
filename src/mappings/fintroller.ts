import { loadOrCreateHifi, loadOrCreateToken } from "../helpers";
import { ListBond, ListCollateral } from "../types/Fintroller/Fintroller";
import { Hifi, Token } from "../types/schema";

export function handleListBond(event: ListBond): void {
  let bondId: string = event.params.bond.toHexString();
  let bond: Token = loadOrCreateToken(bondId);

  let hifi: Hifi = loadOrCreateHifi();
  let listedBonds: string[] = hifi.listedBonds;
  listedBonds.push(bond.id);
  hifi.listedBonds = listedBonds;
  hifi.save();
}

export function handleListCollateral(event: ListCollateral): void {
  let collateralId: string = event.params.collateral.toHexString();
  let collateral: Token = loadOrCreateToken(collateralId);

  let hifi: Hifi = loadOrCreateHifi();
  let listedCollaterals: string[] = hifi.listedCollaterals;
  listedCollaterals.push(collateral.id);
  hifi.listedCollaterals = listedCollaterals;
  hifi.save();
}
