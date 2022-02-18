import { BigDecimal } from "@graphprotocol/graph-ts";

import {
  chainlinkOperatorAddress,
  hTokenDecimals,
  loadOrCreatePool,
  loadOrCreateToken,
  scaleTokenAmount,
} from "../helpers";
import { Swap } from "../types/schema";
import { ChainlinkOperator } from "../types/templates/HifiPool/ChainlinkOperator";
import { AddLiquidity, HifiPool, RemoveLiquidity, Trade } from "../types/templates/HifiPool/HifiPool";

export function handleAddLiquidity(event: AddLiquidity): void {
  let contract: HifiPool = HifiPool.bind(event.address);
  let pool = loadOrCreatePool(event.address.toHex());

  pool.underlyingReserve = pool.underlyingReserve.plus(
    scaleTokenAmount(event.params.underlyingAmount.times(contract.underlyingPrecisionScalar()), 18),
  );
  pool.hTokenReserve = pool.hTokenReserve.plus(scaleTokenAmount(event.params.hTokenAmount, hTokenDecimals));

  pool.save();
}

export function handleRemoveLiquidity(event: RemoveLiquidity): void {
  let contract: HifiPool = HifiPool.bind(event.address);
  let pool = loadOrCreatePool(event.address.toHex());

  pool.underlyingReserve = pool.underlyingReserve.minus(
    scaleTokenAmount(event.params.underlyingAmount.times(contract.underlyingPrecisionScalar()), 18),
  );
  pool.hTokenReserve = pool.hTokenReserve.minus(scaleTokenAmount(event.params.hTokenAmount, hTokenDecimals));

  pool.save();
}

export function handleTrade(event: Trade): void {
  let contract: HifiPool = HifiPool.bind(event.address);
  let pool = loadOrCreatePool(event.address.toHex());
  let swap = new Swap(event.transaction.hash.toHex());

  let underlyingAmount = scaleTokenAmount(
    event.params.underlyingAmount.times(contract.underlyingPrecisionScalar()),
    18,
  );
  let hTokenAmount = scaleTokenAmount(event.params.hTokenAmount, hTokenDecimals);
  let newUnderlyingReserve = pool.underlyingReserve.minus(underlyingAmount);
  let newHTokenReserve = pool.hTokenReserve.minus(hTokenAmount);

  let totalSupply = scaleTokenAmount(HifiPool.bind(event.address).totalSupply(), 18);
  let t = parseFloat(event.params.maturity.minus(event.block.timestamp).toString()) / parseFloat("126144000");
  let oneMinusT = parseFloat("1") - t;
  let a = Math.pow(parseFloat(pool.underlyingReserve.toString()), oneMinusT);
  let b = Math.pow(parseFloat(pool.hTokenReserve.toString()) + parseFloat(totalSupply.toString()), oneMinusT);
  let c = Math.pow(parseFloat(newHTokenReserve.toString()) + parseFloat(totalSupply.toString()), oneMinusT);
  let newUnderlyingReserveWithoutFee = Math.pow(Math.abs(a + b - c), parseFloat("1") / oneMinusT);
  let diff = Math.abs(parseFloat(newUnderlyingReserve.toString()) - newUnderlyingReserveWithoutFee);

  swap.from = event.params.from;
  swap.hTokenAmount = hTokenAmount;
  swap.pool = pool.id;
  swap.swapFee = BigDecimal.fromString(diff.toString());
  let chainlinkOperatorContract = ChainlinkOperator.bind(chainlinkOperatorAddress);
  let underlying = loadOrCreateToken(pool.underlying);
  swap.swapFeeUsd = scaleTokenAmount(chainlinkOperatorContract.getNormalizedPrice(underlying.symbol), 18).times(
    swap.swapFee,
  );
  swap.timestamp = event.block.timestamp;
  swap.to = event.params.to;
  swap.underlyingAmount = underlyingAmount;
  swap.save();

  pool.underlyingReserve = newUnderlyingReserve;
  pool.hTokenReserve = newHTokenReserve;

  pool.save();
}
