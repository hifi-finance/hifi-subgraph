import { Fintroller } from "../types/schema";
import { SetDebtCeiling, SetLiquidationIncentive, SetOracle } from "../types/Fintroller/Fintroller";

function loadOrCreateFintroller(): Fintroller {
  const id: string = "1";
  let fintroller: Fintroller | null = Fintroller.load(id);
  if (fintroller == null) {
    fintroller = new Fintroller(id);
  }
  return fintroller;
}

export function handleSetDebtCeiling(event: SetDebtCeiling): void {
  let fintroller: Fintroller = loadOrCreateFintroller();
  fintroller.debtCeiling = event.params.newDebtCeiling;
  fintroller.save();
}

export function handleSetLiquidationIncentive(event: SetLiquidationIncentive): void {
  let fintroller: Fintroller = loadOrCreateFintroller();
  fintroller.liquidationIncentive = event.params.newLiquidationIncentive;
  fintroller.save();
}

export function handleSetOracle(event: SetOracle): void {
  let fintroller: Fintroller = loadOrCreateFintroller();
  fintroller.oracle = event.params.newOracle;
  fintroller.save();
}
