import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

export function expand(decimals: i32): BigInt {
  let long = BigInt.fromI32(1);
  for (let i = BigInt.fromI32(0); i.lt(BigInt.fromI32(decimals)); i = i.plus(BigInt.fromI32(1))) {
    long = long.times(BigInt.fromI32(10));
  }
  return long;
}

export function normalize(bigInt: BigInt, decimals: i32 = 18): BigDecimal {
  return bigInt.toBigDecimal().div(expand(decimals).toBigDecimal());
}
