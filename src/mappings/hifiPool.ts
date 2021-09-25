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

  swap.from = event.params.from;
  swap.hTokenAmount = normalize(event.params.hTokenAmount);
  // // TODO: calculate swapFee
  // // let contract = ...
  // swap.swapFee = contract.getImplicitSwapFee(event.params.underlyingAmount, event.params.hTokenAmount, newHtokenAmount, block.timestamp)
  // swap.swapFee = BigDecimal.fromString("0");
  swap.timestamp = event.block.timestamp;
  swap.to = event.params.to;
  swap.underlyingAmount = normalize(event.params.underlyingAmount.times(pool.underlyingPrecisionScalar));
  swap.save();

  let swaps = pool.swaps;
  swaps.push(swap.id);
  pool.swaps = swaps;
  pool.underlyingReserve = pool.underlyingReserve.minus(swap.underlyingAmount);
  pool.hTokenReserve = pool.hTokenReserve.minus(swap.hTokenAmount);

  pool.save();
}

export function handleApproval(event: Approval): void {}

export function handleTransfer(event: Transfer): void {}
