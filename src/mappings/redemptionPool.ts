import { BigDecimal, log } from "@graphprotocol/graph-ts";

import { Account, AccountFyToken, FyToken, RedemptionPool, Token } from "../types/schema";
import { RedeemFyTokens, SupplyUnderlying } from "../types/templates/RedemptionPool/RedemptionPool";
import {
  createAccountFyTokenTransaction,
  getAccountFyTokenId,
  loadOrCreateAccount,
  loadOrCreateAccountFyToken,
} from "../helpers/database";
import { fyTokenDecimalsBd } from "../helpers/constants";
import { scaleTokenAmount } from "../helpers/math";

export function handleRedeemFyTokens(event: RedeemFyTokens): void {
  let accountId: string = event.params.account.toHexString();
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

  let fyTokenId: string = redemptionPool.fyToken;
  let accountFyTokenId: string = getAccountFyTokenId(fyTokenId, accountId);
  let accountFyToken: AccountFyToken | null = AccountFyToken.load(accountFyTokenId);
  if (accountFyToken == null) {
    log.error("AccountFyToken entity expected to exist when {} redeemed fyTokens", [accountId]);
    return;
  }

  // The FyToken and the Underlying entities exist because bonds have to be listed
  // in the Fintroller before a redeem fyTokens can occur.
  let fyToken: FyToken | null = FyToken.load(fyTokenId);
  let underlyingId: string = fyToken.underlying;
  let underlying: Token | null = Token.load(underlyingId);
  let underlyingAmountBd: BigDecimal = scaleTokenAmount(event.params.underlyingAmount, underlying.decimals);

  // "totalUnderlyingSupply" tracks the total amount of underlying deposited.
  redemptionPool.totalUnderlyingSupply = redemptionPool.totalUnderlyingSupply.minus(underlyingAmountBd);
  redemptionPool.save();

  // Whereas "totalFyTokenRedeemed" and "totalUnderlyingRedeemed" are increasing monotonically.
  let fyTokenAmountBd: BigDecimal = event.params.fyTokenAmount.toBigDecimal().div(fyTokenDecimalsBd);
  accountFyToken.totalFyTokenRedeemed = accountFyToken.totalFyTokenRedeemed.plus(fyTokenAmountBd);
  accountFyToken.totalUnderlyingRedeemed = accountFyToken.totalUnderlyingRedeemed.plus(underlyingAmountBd);
  accountFyToken.save();

  createAccountFyTokenTransaction(fyTokenId, accountId, event);
}

export function handleSupplyUnderlying(event: SupplyUnderlying): void {
  let accountId: string = event.params.account.toHexString();
  loadOrCreateAccount(accountId);

  let redemptionPoolId: string = event.address.toHexString();
  let redemptionPool: RedemptionPool | null = RedemptionPool.load(redemptionPoolId);
  if (redemptionPool == null) {
    log.error("RedemptionPool entity expected to exist when {} supplied underlying", [accountId]);
    return;
  }

  // The underlying and fyToken entities exist because bonds have to be listed
  // in the Fintroller before a supply underlying can occur.
  let fyTokenId: string = redemptionPool.fyToken;
  let accountFyToken: AccountFyToken = loadOrCreateAccountFyToken(fyTokenId, accountId);

  let fyToken: FyToken | null = FyToken.load(fyTokenId);
  let underlyingId: string = fyToken.underlying;
  let underlying: Token | null = Token.load(underlyingId);
  let underlyingAmountBd: BigDecimal = scaleTokenAmount(event.params.underlyingAmount, underlying.decimals);

  // "totalUnderlyingSupply" tracks the total amount of underlying deposited.
  redemptionPool.totalUnderlyingSupply = redemptionPool.totalUnderlyingSupply.plus(underlyingAmountBd);
  redemptionPool.save();

  // Whereas "totalUnderlyingSupplied" is increasing monotonically.
  accountFyToken.totalUnderlyingSupplied = accountFyToken.totalUnderlyingSupplied.plus(underlyingAmountBd);
  accountFyToken.save();

  createAccountFyTokenTransaction(fyTokenId, accountId, event);
}
