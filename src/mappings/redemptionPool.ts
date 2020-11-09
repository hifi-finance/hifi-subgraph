import { BigDecimal, log } from "@graphprotocol/graph-ts";

import { Account, AccountFyToken, RedemptionPool } from "../types/schema";
import { RedeemFyTokens, SupplyUnderlying } from "../types/templates/RedemptionPool/RedemptionPool";
import {
  createAccountFyTokenTransaction,
  getAccountFyTokenId,
  loadOrCreateAccount,
  loadOrCreateAccountFyToken,
} from "../helpers/database";

export function handleRedeemFyTokens(event: RedeemFyTokens): void {
  let accountId: string = event.params.account.toHexString();
  let fyTokenAmount: BigDecimal = event.params.fyTokenAmount.toBigDecimal();

  let account: Account | null = Account.load(accountId);
  if (account == null) {
    log.error("Account entity expected to exist when {} redeemed fyTokens", [accountId]);
    return;
  }

  let redemptionPoolId: string = event.address.toHexString();
  let redemptionPool: RedemptionPool | null = RedemptionPool.load(redemptionPoolId);
  if (redemptionPool == null) {
    log.error("RedemptionPool entity expected to exist when {} redeemed fyTokens", [accountId]);
    return;
  }
  redemptionPool.totalUnderlyingSupply = redemptionPool.totalUnderlyingSupply.plus(fyTokenAmount);
  redemptionPool.save();

  let fyTokenId: string = redemptionPool.fyToken;
  let accountFyTokenId: string = getAccountFyTokenId(fyTokenId, accountId);
  let accountFyToken: AccountFyToken | null = AccountFyToken.load(accountFyTokenId);
  if (accountFyToken == null) {
    log.error("AccountFyToken entity expected to exist when {} redeemed fyTokens", [accountId]);
    return;
  }
  accountFyToken.totalFyTokenRedeemed = accountFyToken.totalFyTokenRedeemed.plus(fyTokenAmount);
  accountFyToken.save();

  createAccountFyTokenTransaction(fyTokenId, accountId, event);
}

export function handleSupplyUnderlying(event: SupplyUnderlying): void {
  let accountId: string = event.params.account.toHexString();
  let underlyingAmount: BigDecimal = event.params.underlyingAmount.toBigDecimal();

  loadOrCreateAccount(accountId);

  let redemptionPoolId: string = event.address.toHexString();
  let redemptionPool: RedemptionPool | null = RedemptionPool.load(redemptionPoolId);
  if (redemptionPool == null) {
    log.error("RedemptionPool entity expected to exist when {} supplied underlying", [accountId]);
    return;
  }

  let fyTokenId: string = redemptionPool.fyToken;
  let accountFyToken: AccountFyToken = loadOrCreateAccountFyToken(fyTokenId, accountId);
  accountFyToken.totalUnderlyingSupplied = accountFyToken.totalUnderlyingSupplied.plus(underlyingAmount);
  accountFyToken.save();

  createAccountFyTokenTransaction(fyTokenId, accountId, event);
}
