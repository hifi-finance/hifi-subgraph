import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

export function exponentToBigDecimal(exponent: i32): BigDecimal {
  return BigInt.fromI32(10)
    .pow(exponent as u8)
    .toBigDecimal();
}

/**
 * Converts number to a float format, using the BigDecimal type.
 */
export function scaleTokenAmount(amount: BigInt, decimals: i32): BigDecimal {
  let precisionScalar: BigDecimal = exponentToBigDecimal(decimals);
  return amount.toBigDecimal().div(precisionScalar);
}
