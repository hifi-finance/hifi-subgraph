import { BigDecimal } from "@graphprotocol/graph-ts";

import { loadOrCreatePool, normalize } from "../helpers";
import { Swap } from "../types/schema";
import { AddLiquidity, Approval, RemoveLiquidity, Trade, Transfer } from "../types/templates/HifiPool/HifiPool";

export function handleAddLiquidity(event: AddLiquidity): void {
  let pool = loadOrCreatePool(event.address.toHex());

  pool.underlyingReserve = pool.underlyingReserve.plus(
    normalize(event.params.underlyingAmount.times(pool.underlyingPrecisionScalar)),
  );
  pool.hTokenReserve = pool.hTokenReserve.plus(normalize(event.params.hTokenAmount));

  pool.save();
}

export function handleRemoveLiquidity(event: RemoveLiquidity): void {
  let pool = loadOrCreatePool(event.address.toHex());

  pool.underlyingReserve = pool.underlyingReserve.minus(
    normalize(event.params.underlyingAmount.times(pool.underlyingPrecisionScalar)),
  );
  pool.hTokenReserve = pool.hTokenReserve.minus(normalize(event.params.hTokenAmount));

  pool.save();
}

export function handleTrade(event: Trade): void {
  let pool = loadOrCreatePool(event.address.toHex());
  let swap = new Swap(event.transaction.hash.toHex());

  let underlyingAmount = normalize(event.params.underlyingAmount.times(pool.underlyingPrecisionScalar));
  let hTokenAmount = normalize(event.params.hTokenAmount);
  let newUnderlyingReserve = pool.underlyingReserve.minus(underlyingAmount);
  let newHTokenReserve = pool.hTokenReserve.minus(hTokenAmount);

  let t: f64 = <f64>event.params.maturity.minus(event.block.timestamp).toI32() / <f64>126144000;
  let oneMinusT: f64 = <f64>1 - t;
  let a: f64 = Math.pow(parseFloat(pool.underlyingReserve.toString()), oneMinusT);
  let b: f64 = Math.pow(parseFloat(pool.hTokenReserve.toString()), oneMinusT);
  let c: f64 = Math.pow(parseFloat(newHTokenReserve.toString()), oneMinusT);
  let newUnderlyingReserveWithoutFee: f64 = Math.pow(a + b - c, <f64>1 / oneMinusT);
  let diff = Math.abs(parseFloat(newUnderlyingReserve.toString()) - newUnderlyingReserveWithoutFee);

  swap.from = event.params.from;
  swap.hTokenAmount = hTokenAmount;
  swap.swapFee = BigDecimal.fromString(diff.toString());
  swap.timestamp = event.block.timestamp;
  swap.to = event.params.to;
  swap.underlyingAmount = underlyingAmount;
  swap.save();

  let swaps = pool.swaps;
  swaps.push(swap.id);
  pool.swaps = swaps;
  pool.underlyingReserve = newUnderlyingReserve;
  pool.hTokenReserve = newHTokenReserve;

  pool.save();
}

export function handleApproval(event: Approval): void {}

export function handleTransfer(event: Transfer): void {}
