import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";

export let addressZero: Address = Address.fromString("0x0000000000000000000000000000000000000000");
export let defaultLiquidationIncentive: BigInt = BigInt.fromI32(10).pow(18).plus(BigInt.fromI32(10).pow(17)); // 1100000000000000000
export let fintrollerDefaultId: string = "1";
export let fyTokenDecimals = 18;
export let mantissaBd: BigDecimal = BigInt.fromI32(10).pow(18).toBigDecimal(); // 1000000000000000000
export let zeroBd: BigDecimal = BigDecimal.fromString("0");
