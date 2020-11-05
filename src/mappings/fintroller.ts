import { Fintroller, FyToken } from "../types/schema";
import { log } from "@graphprotocol/graph-ts";

import { ListBond, SetDebtCeiling, SetLiquidationIncentive, SetOracle } from "../types/Fintroller/Fintroller";
import { loadOrCreateFintroller, loadOrCreateFyToken } from "../helpers/database";

export function handleListBond(event: ListBond): void {
  const fyTokenAddress: string = event.params.fyToken.toString();
  let fyToken: FyToken | null = FyToken.load(fyTokenAddress);
  if (fyToken != null) {
    log.error("FyToken entity expected to be null when listing bond: {}", [fyTokenAddress]);
    return;
  }

  let fintroller: Fintroller = loadOrCreateFintroller();
  fintroller.save();

  fyToken = loadOrCreateFyToken(fyTokenAddress);
  fyToken.save();
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
