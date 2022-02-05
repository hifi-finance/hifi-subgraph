import { loadOrCreatePool, removePool } from "../helpers";
import { TrackPool, UntrackPool } from "../types/HifiPoolRegistry/HifiPoolRegistry";

export function handleTrackPool(event: TrackPool): void {
  loadOrCreatePool(event.params.pool.toHexString());
}

export function handleUntrackPool(event: UntrackPool): void {
  removePool(event.params.pool.toHexString());
}
