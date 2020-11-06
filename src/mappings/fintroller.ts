import { log } from "@graphprotocol/graph-ts";

import { ListBond, SetDebtCeiling, SetLiquidationIncentive, SetOracle } from "../types/Fintroller/Fintroller";
import { Fintroller, FyToken } from "../types/schema";
import { createFyToken, loadOrCreateFintroller } from "../helpers/database";

export function handleListBond(event: ListBond): void {
  loadOrCreateFintroller();

  let fyTokenId: string = event.params.fyToken.toString();
  let fyToken: FyToken | null = FyToken.load(fyTokenId);
  if (fyToken != null) {
    log.error("FyToken entity expected to be null when listing bond: {}", [fyTokenId]);
    return;
  }
  createFyToken(fyTokenId);
}

export function handleSetDebtCeiling(event: SetDebtCeiling): void {
  loadOrCreateFintroller();

  let fyTokenId: string = event.params.fyToken.toString();
  let fyToken: FyToken | null = FyToken.load(fyTokenId);
  if (fyToken == null) {
    log.error("FyToken entity expected to be exist when setting the debt ceiling: {}", [fyTokenId]);
    return;
  }
  fyToken.debtCeiling = event.params.newDebtCeiling.toBigDecimal();
  fyToken.save();
}

export function handleSetLiquidationIncentive(event: SetLiquidationIncentive): void {
  let fintroller: Fintroller = loadOrCreateFintroller();
  fintroller.liquidationIncentiveMantissa = event.params.newLiquidationIncentive.toBigDecimal();
  fintroller.save();
}

export function handleSetOracle(event: SetOracle): void {
  let fintroller: Fintroller = loadOrCreateFintroller();
  fintroller.oracle = event.params.newOracle;
  fintroller.save();
}
