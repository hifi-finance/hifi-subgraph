import { log } from "@graphprotocol/graph-ts";

import {
  ListBond as ListBondEvent,
  SetBondDebtCeiling as SetBondDebtCeilingEvent,
  SetLiquidationIncentive as SetLiquidationIncentiveEvent,
  SetOracle as SetOracleEvent,
} from "../types/Fintroller/Fintroller";
import { Fintroller, FyToken } from "../types/schema";
import { createFyToken, createRedemptionPool, loadOrCreateFintroller } from "../helpers/database";
import { mantissaBd } from "../helpers/constants";

export function handleListBond(event: ListBondEvent): void {
  loadOrCreateFintroller();

  // Create the FyToken entity.
  let fyTokenId: string = event.params.fyToken.toHexString();
  let fyToken: FyToken | null = FyToken.load(fyTokenId);
  if (fyToken != null) {
    log.error("FyToken entity expected to be null when listing bond: {}", [fyTokenId]);
    return;
  }
  fyToken = createFyToken(fyTokenId);

  // Create the RedemptionPool entity.
  let redemptionPoolId: string = fyToken.redemptionPool;
  createRedemptionPool(redemptionPoolId, fyTokenId);
}

export function handleSetBondDebtCeiling(event: SetBondDebtCeilingEvent): void {
  loadOrCreateFintroller();

  let fyTokenId: string = event.params.fyToken.toHexString();
  let fyToken: FyToken | null = FyToken.load(fyTokenId);
  if (fyToken == null) {
    log.error("FyToken entity expected to be exist when setting the debt ceiling: {}", [fyTokenId]);
    return;
  }
  fyToken.debtCeiling = event.params.newDebtCeiling.toBigDecimal().div(mantissaBd);
  fyToken.save();
}

export function handleSetLiquidationIncentive(event: SetLiquidationIncentiveEvent): void {
  let fintroller: Fintroller = loadOrCreateFintroller();
  fintroller.liquidationIncentiveMantissa = event.params.newLiquidationIncentive;
  fintroller.save();
}

export function handleSetOracle(event: SetOracleEvent): void {
  let fintroller: Fintroller = loadOrCreateFintroller();
  fintroller.oracle = event.params.newOracle;
  fintroller.save();
}
