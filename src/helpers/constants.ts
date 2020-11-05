import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";

export const addressZero: Address = Address.fromString("0x0000000000000000000000000000000000000000");
// Equivalent to 1100000000000000000.
export const defaultLiquidationIncentive: BigInt = BigInt.fromUnsignedBytes(Bytes.fromHexString("0xde0b6b3a7640000"));
