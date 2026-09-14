import type { StoreSummary } from "@/features/stores/store-types";
import type { StampDisplayData } from "./stamp-queries";

export type StampSnapshot = {
  userId: string;
  stores: StoreSummary[];
  stampData: StampDisplayData;
  fetchedAt: number;
};

let snapshot: StampSnapshot | null = null;
const listeners = new Set<() => void>();
const TTL_MS = 5 * 60_000;

export function readStampSnapshot(userId: string, now = Date.now()) {
  return snapshot?.userId === userId && now >= snapshot.fetchedAt &&
    now - snapshot.fetchedAt < TTL_MS ? snapshot : null;
}

export function rememberStampSnapshot(value: StampSnapshot) {
  if (snapshot?.userId === value.userId && snapshot.fetchedAt > value.fetchedAt) return;
  snapshot = value;
  for (const listener of listeners) listener();
}

export function clearStampSnapshot() {
  snapshot = null;
  for (const listener of listeners) listener();
}

export function subscribeStampSnapshot(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
