import { log, store } from "@graphprotocol/graph-ts";

import { createPool, loadOrCreateHifi } from "../helpers";
import { TrackPool, UntrackPool } from "../types/HifiPoolRegistry/HifiPoolRegistry";
import { Hifi, Pool } from "../types/schema";

export function handleTrackPool(event: TrackPool): void {
  let poolId: string = event.params.pool.toHexString();
  let pool: Pool | null = Pool.load(poolId);
  if (pool != null) {
    log.critical("Pool entity of id {} expected to not exist when tracking pool", [poolId]);
    return;
  }
  createPool(poolId);

  let hifi: Hifi = loadOrCreateHifi();
  let pools: string[] = hifi.pools;
  pools.push(poolId);
  hifi.pools = pools;
  hifi.save();
}

export function handleUntrackPool(event: UntrackPool): void {
  let poolId: string = event.params.pool.toHexString();
  let pool: Pool | null = Pool.load(poolId);
  if (pool == null) {
    log.critical("Pool entity of id {} expected to exist when untracking pool", [poolId]);
    return;
  }
  store.remove("Pool", poolId);
}
