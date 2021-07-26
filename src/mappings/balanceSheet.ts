import {
  Borrow,
  DepositCollateral,
  LiquidateBorrow,
  RepayBorrow,
  SetOracle,
  TransferOwnership,
  WithdrawCollateral,
} from "../types/BalanceSheet/BalanceSheet";

import { BigInt } from "@graphprotocol/graph-ts";
import { Vault } from "../types/schema";

export function handleBorrow(event: Borrow): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = Vault.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (entity == null) {
    entity = new Vault(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity.account = event.params.account
  entity.bond = event.params.bond

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.fintroller(...)
  // - contract.getBondList(...)
  // - contract.getCollateralAmount(...)
  // - contract.getCollateralList(...)
  // - contract.getCurrentAccountLiquidity(...)
  // - contract.getDebtAmount(...)
  // - contract.getHypotheticalAccountLiquidity(...)
  // - contract.getSeizableCollateralAmount(...)
  // - contract.oracle(...)
  // - contract.owner(...)
}

export function handleDepositCollateral(event: DepositCollateral): void {
  let account = event.params.account.toString();
  let vault: Vault | null = Vault.load(account);
  if (vault == null) {
    vault = new Vault(account);
    vault.debt = BigInt.fromI32(0);
    vault.isOpen = true;
    vault.save();
  }
}

export function handleLiquidateBorrow(event: LiquidateBorrow): void {}

export function handleRepayBorrow(event: RepayBorrow): void {}

export function handleSetOracle(event: SetOracle): void {}

export function handleTransferOwnership(event: TransferOwnership): void {}

export function handleWithdrawCollateral(event: WithdrawCollateral): void {}
