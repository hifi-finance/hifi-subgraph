import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

export function exponentToLong(decimals: BigInt): BigInt {
  let long = BigInt.fromI32(1);
  for (let i = BigInt.fromI32(0); i.lt(decimals as BigInt); i = i.plus(BigInt.fromI32(1))) {
    long = long.times(BigInt.fromI32(10));
  }
  return long;
}

export function normalize(bigInt: BigInt): BigDecimal {
  return bigInt.toBigDecimal().div(exponentToLong(BigInt.fromI32(18)).toBigDecimal());
}
