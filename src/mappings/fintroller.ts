import { loadOrCreateHifi, loadOrCreateToken } from "../helpers";
import { ListBond, ListCollateral } from "../types/Fintroller/Fintroller";

export function handleListBond(event: ListBond): void {
  let bond = loadOrCreateToken(event.params.bond.toHex());
  let hifi = loadOrCreateHifi();
  let listedBonds = hifi.listedBonds;
  listedBonds.push(bond.id);
  hifi.listedBonds = listedBonds;
  hifi.save();
}

export function handleListCollateral(event: ListCollateral): void {
  let collateral = loadOrCreateToken(event.params.collateral.toHex());
  let hifi = loadOrCreateHifi();
  let listedCollaterals = hifi.listedCollaterals;
  listedCollaterals.push(collateral.id);
  hifi.listedCollaterals = listedCollaterals;
  hifi.save();
}
