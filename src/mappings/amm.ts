import {
  AddLiquidity,
  Approval,
  HifiPool,
  RemoveLiquidity,
  Trade,
  Transfer,
} from "../types/templates/HifiPool/HifiPool";
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { Pool, Swap } from "../types/schema";

import { normalize } from "../helpers";

export function handleAddLiquidity(event: AddLiquidity): void {
  let pool = Pool.load(event.address.toHex());

  if (pool == null) {
    pool = new Pool(event.address.toHex());
    pool.maturity = event.params.maturity;

    let contract = HifiPool.bind(event.address);
    pool.underlying = contract.underlying();
    pool.hToken = contract.hToken();
    pool.underlyingPrecisionScalar = contract.underlyingPrecisionScalar();

    pool.underlyingReserve = BigDecimal.fromString("0");
    pool.hTokenReserve = BigDecimal.fromString("0");
    pool.swaps = [];
  }

  pool.underlyingReserve = pool.underlyingReserve.plus(
    normalize(event.params.underlyingAmount.times(pool.underlyingPrecisionScalar)),
  );
  pool.hTokenReserve = pool.hTokenReserve.plus(normalize(event.params.hTokenAmount));

  pool.save();
}

export function handleRemoveLiquidity(event: RemoveLiquidity): void {
  let pool = Pool.load(event.address.toHex());

  pool.underlyingReserve = pool.underlyingReserve.minus(
    normalize(event.params.underlyingAmount.times(pool.underlyingPrecisionScalar)),
  );
  pool.hTokenReserve = pool.hTokenReserve.minus(normalize(event.params.hTokenAmount));

  pool.save();
}

export function handleTrade(event: Trade): void {
  let pool = Pool.load(event.address.toHex());
  let swap = new Swap(BigInt.fromI32(pool.swaps.length).toHex());

  swap.timestamp = event.block.timestamp;

  swap.from = event.params.from;
  swap.to = event.params.to;
  swap.underlyingAmount = normalize(event.params.underlyingAmount.times(pool.underlyingPrecisionScalar));
  swap.hTokenAmount = normalize(event.params.hTokenAmount);

  swap.save();

  pool.swaps = pool.swaps.concat([swap.id]);

  pool.underlyingReserve = pool.underlyingReserve.minus(swap.underlyingAmount);
  pool.hTokenReserve = pool.hTokenReserve.minus(swap.hTokenAmount);

  pool.save();
}

export function handleApproval(event: Approval): void {}

export function handleTransfer(event: Transfer): void {}
