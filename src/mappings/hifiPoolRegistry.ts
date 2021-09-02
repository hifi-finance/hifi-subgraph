import { TrackPool, TransferOwnership, UntrackPool } from "../types/HifiPoolRegistry/HifiPoolRegistry";
import { loadOrCreatePool, removePool } from "../helpers";

export function handleTrackPool(event: TrackPool): void {
  loadOrCreatePool(event.params.pool.toHexString());
}

export function handleTransferOwnership(event: TransferOwnership): void {}

export function handleUntrackPool(event: UntrackPool): void {
  removePool(event.params.pool.toHexString());
}
