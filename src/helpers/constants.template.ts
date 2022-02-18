import { Address, BigDecimal } from "@graphprotocol/graph-ts";

export const defaultHifiId = "1";
export const chainlinkOperatorAddress = Address.fromString("{{contracts.chainlinkOperator.address}}");
export const hTokenDecimals = 18;
export const zeroBd = BigDecimal.fromString("0");
