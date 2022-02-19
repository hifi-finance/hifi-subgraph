import { BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";

import { chainlinkOperatorAddress, scaleTokenAmount } from "../helpers";
import { Pool, Swap, Token } from "../types/schema";
import { ChainlinkOperator } from "../types/templates/HifiPool/ChainlinkOperator";
import { AddLiquidity, HifiPool, RemoveLiquidity, Trade } from "../types/templates/HifiPool/HifiPool";

export function handleAddLiquidity(event: AddLiquidity): void {
  let poolId: string = event.address.toHexString();
  let pool: Pool | null = Pool.load(poolId);
  if (pool == null) {
    log.critical("Pool entity of id {} expected to exist when adding liquidity to pool", [poolId]);
    return;
  }

  let bond: Token | null = Token.load(pool.hToken);
  if (bond == null) {
    log.critical("Token entity of id {} expected to exist when adding liquidity to pool {}", [pool.underlying, poolId]);
    return;
  }

  let underlying: Token | null = Token.load(pool.underlying);
  if (underlying == null) {
    log.critical("Token entity of id {} expected to exist when adding liquidity to pool {}", [pool.underlying, poolId]);
    return;
  }

  let hTokenAmount: BigInt = event.params.hTokenAmount;
  let hTokenAmountBd: BigDecimal = scaleTokenAmount(hTokenAmount, bond.decimals);
  pool.hTokenReserve = pool.hTokenReserve.plus(hTokenAmountBd);
  let underlyingAmount: BigInt = event.params.underlyingAmount;
  let underlyingAmountBd: BigDecimal = scaleTokenAmount(underlyingAmount, underlying.decimals);
  pool.underlyingReserve = pool.underlyingReserve.plus(underlyingAmountBd);
  pool.save();
}

export function handleRemoveLiquidity(event: RemoveLiquidity): void {
  let poolId: string = event.address.toHexString();
  let pool: Pool | null = Pool.load(poolId);
  if (pool == null) {
    log.critical("Pool entity of id {} expected to exist when removing liquidity from pool", [poolId]);
    return;
  }

  let bond: Token | null = Token.load(pool.hToken);
  if (bond == null) {
    log.critical("Token entity of id {} expected to exist when removing liquidity from pool {}", [
      pool.underlying,
      poolId,
    ]);
    return;
  }

  let underlying: Token | null = Token.load(pool.underlying);
  if (underlying == null) {
    log.critical("Token entity of id {} expected to exist when removing liquidity from pool {}", [
      pool.underlying,
      poolId,
    ]);
    return;
  }

  let hTokenAmount: BigInt = event.params.hTokenAmount;
  let hTokenAmountBd: BigDecimal = scaleTokenAmount(hTokenAmount, bond.decimals);
  pool.hTokenReserve = pool.hTokenReserve.minus(hTokenAmountBd);
  let underlyingAmount: BigInt = event.params.underlyingAmount;
  let underlyingAmountBd: BigDecimal = scaleTokenAmount(underlyingAmount, underlying.decimals);
  pool.underlyingReserve = pool.underlyingReserve.minus(underlyingAmountBd);
  pool.save();
}

export function handleTrade(event: Trade): void {
  let poolId: string = event.address.toHexString();
  let pool: Pool | null = Pool.load(poolId);
  if (pool == null) {
    log.critical("Pool entity of id {} expected to exist when trading", [poolId]);
    return;
  }

  let bond: Token | null = Token.load(pool.hToken);
  if (bond == null) {
    log.critical("Token entity of id {} expected to exist when trading in pool {}", [pool.underlying, poolId]);
    return;
  }

  let underlying: Token | null = Token.load(pool.underlying);
  if (underlying == null) {
    log.critical("Token entity of id {} expected to exist when trading in pool {}", [pool.underlying, poolId]);
    return;
  }

  let swapId: string = event.transaction.hash.toHexString();
  let swap: Swap = new Swap(swapId);

  let hTokenAmount: BigInt = event.params.hTokenAmount;
  let hTokenAmountBd: BigDecimal = scaleTokenAmount(hTokenAmount, bond.decimals);
  let newHTokenReserve = pool.hTokenReserve.minus(hTokenAmountBd);
  let underlyingAmount: BigInt = event.params.underlyingAmount;
  let underlyingAmountBd: BigDecimal = scaleTokenAmount(underlyingAmount, underlying.decimals);
  let newUnderlyingReserve = pool.underlyingReserve.minus(underlyingAmountBd);
  let totalSupply = scaleTokenAmount(HifiPool.bind(event.address).totalSupply(), 18);
  let t = parseFloat(event.params.maturity.minus(event.block.timestamp).toString()) / parseFloat("126144000");
  let oneMinusT = parseFloat("1") - t;
  let a = Math.pow(parseFloat(pool.underlyingReserve.toString()), oneMinusT);
  let b = Math.pow(parseFloat(pool.hTokenReserve.toString()) + parseFloat(totalSupply.toString()), oneMinusT);
  let c = Math.pow(parseFloat(newHTokenReserve.toString()) + parseFloat(totalSupply.toString()), oneMinusT);
  let newUnderlyingReserveWithoutFee = Math.pow(Math.abs(a + b - c), parseFloat("1") / oneMinusT);
  let diff = Math.abs(parseFloat(newUnderlyingReserve.toString()) - newUnderlyingReserveWithoutFee);
  swap.from = event.params.from;
  swap.hTokenAmount = hTokenAmountBd;
  swap.pool = pool.id;
  swap.swapFee = BigDecimal.fromString(diff.toString());
  let chainlinkOperatorContract = ChainlinkOperator.bind(chainlinkOperatorAddress);
  swap.swapFeeUsd = scaleTokenAmount(chainlinkOperatorContract.getNormalizedPrice(underlying.symbol), 18).times(
    swap.swapFee,
  );
  swap.timestamp = event.block.timestamp;
  swap.to = event.params.to;
  swap.underlyingAmount = underlyingAmountBd;
  swap.save();

  pool.underlyingReserve = newUnderlyingReserve;
  pool.hTokenReserve = newHTokenReserve;
  pool.save();
}
