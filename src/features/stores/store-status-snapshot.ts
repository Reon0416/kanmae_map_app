import type { Store } from "@/features/stores/store-types";

export type StoreStatusSnapshot = Pick<Store, "id" | "status" | "waitTime" | "lastUpdatedAt"> & { fetchedAt: number };

const SNAPSHOT_TTL_MS = 60_000;
const snapshots = new Map<string, StoreStatusSnapshot>();
const listeners = new Set<() => void>();

export function rememberStoreStatuses(values: StoreStatusSnapshot[]) {
  for (const value of values) {
    const previous = snapshots.get(value.id);
    if (!previous || value.fetchedAt > previous.fetchedAt) snapshots.set(value.id, value);
  }
  for (const listener of listeners) listener();
}

export function readStoreStatusSnapshot(storeId: string, now = Date.now()) {
  const value = snapshots.get(storeId);
  return value && now >= value.fetchedAt && now - value.fetchedAt < SNAPSHOT_TTL_MS ? value : null;
}

export function subscribeStoreStatuses(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
