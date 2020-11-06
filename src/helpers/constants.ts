import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";

export let addressZero: Address = Address.fromString("0x0000000000000000000000000000000000000000");
// Equivalent to 1100000000000000000, or 110%.
export let defaultLiquidationIncentive: BigDecimal = BigInt.fromI32(10)
  .pow(18)
  .plus(BigInt.fromI32(10).pow(17))
  .toBigDecimal();
export let fintrollerDefaultId: string = "1";
export let zeroBd: BigDecimal = BigDecimal.fromString("0");
