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
