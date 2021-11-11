import { Address, BigDecimal } from "@graphprotocol/graph-ts";

import { CHAINLINK_OPERATOR_ADDRESS, loadOrCreatePool, loadOrCreateToken, normalize } from "../helpers";
import { Swap } from "../types/schema";
import { ChainlinkOperator } from "../types/templates/HifiPool/ChainlinkOperator";
import {
  AddLiquidity,
  Approval,
  HifiPool,
  RemoveLiquidity,
  Trade,
  Transfer,
} from "../types/templates/HifiPool/HifiPool";

export function handleAddLiquidity(event: AddLiquidity): void {
  let contract: HifiPool = HifiPool.bind(event.address);
  let pool = loadOrCreatePool(event.address.toHex());

  pool.underlyingReserve = pool.underlyingReserve.plus(
    normalize(event.params.underlyingAmount.times(contract.underlyingPrecisionScalar())),
  );
  pool.hTokenReserve = pool.hTokenReserve.plus(normalize(event.params.hTokenAmount));

  pool.save();
}

export function handleRemoveLiquidity(event: RemoveLiquidity): void {
  let contract: HifiPool = HifiPool.bind(event.address);
  let pool = loadOrCreatePool(event.address.toHex());

  pool.underlyingReserve = pool.underlyingReserve.minus(
    normalize(event.params.underlyingAmount.times(contract.underlyingPrecisionScalar())),
  );
  pool.hTokenReserve = pool.hTokenReserve.minus(normalize(event.params.hTokenAmount));

  pool.save();
}

export function handleTrade(event: Trade): void {
  let contract: HifiPool = HifiPool.bind(event.address);
  let pool = loadOrCreatePool(event.address.toHex());
  let swap = new Swap(event.transaction.hash.toHex());

  let underlyingAmount = normalize(event.params.underlyingAmount.times(contract.underlyingPrecisionScalar()));
  let hTokenAmount = normalize(event.params.hTokenAmount);
  let newUnderlyingReserve = pool.underlyingReserve.minus(underlyingAmount);
  let newHTokenReserve = pool.hTokenReserve.minus(hTokenAmount);

  let totalSupply = normalize(HifiPool.bind(event.address).totalSupply());
  let t: f64 = parseFloat(event.params.maturity.minus(event.block.timestamp).toString()) / parseFloat("126144000");
  let oneMinusT: f64 = parseFloat("1") - t;
  let a: f64 = Math.pow(parseFloat(pool.underlyingReserve.toString()), oneMinusT);
  let b: f64 = Math.pow(parseFloat(pool.hTokenReserve.toString()) + parseFloat(totalSupply.toString()), oneMinusT);
  let c: f64 = Math.pow(parseFloat(newHTokenReserve.toString()) + parseFloat(totalSupply.toString()), oneMinusT);
  let newUnderlyingReserveWithoutFee: f64 = Math.pow(Math.abs(a + b - c), parseFloat("1") / oneMinusT);
  let diff = Math.abs(parseFloat(newUnderlyingReserve.toString()) - newUnderlyingReserveWithoutFee);

  swap.from = event.params.from;
  swap.hTokenAmount = hTokenAmount;
  swap.swapFee = BigDecimal.fromString(diff.toString());
  let chainlinkOperatorContract = ChainlinkOperator.bind(Address.fromString(CHAINLINK_OPERATOR_ADDRESS));
  let underlying = loadOrCreateToken(pool.underlying.toHex());
  swap.swapFeeUsd = normalize(chainlinkOperatorContract.getNormalizedPrice(underlying.symbol)).times(swap.swapFee);
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
