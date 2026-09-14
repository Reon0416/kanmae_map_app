"use client";

import { useCallback, useSyncExternalStore } from "react";
import { VisitStampCard } from "./VisitStampCard";
import type { StampDisplayData } from "@/features/visit-records/stamp-queries";
import {
  clearStampSnapshot, readStampSnapshot, rememberStampSnapshot, subscribeStampSnapshot,
  type StampSnapshot
} from "@/features/visit-records/stamp-snapshot";

const emptyServerSnapshot = () => null;

export function StampLoading() {
  return <div className="min-h-96 px-4 py-5" role="status" aria-label="スタンプを読み込み中" aria-busy="true">
    <div className="h-96 rounded-lg bg-slate-100 motion-safe:animate-pulse" aria-hidden="true" />
  </div>;
}

export function CachedStampContent({ userId, value }: { userId: string; value?: StampSnapshot }) {
  const getSnapshot = useCallback(() => readStampSnapshot(userId), [userId]);
  const cached = useSyncExternalStore(subscribeStampSnapshot, getSnapshot, emptyServerSnapshot);
  const data = value ?? cached;
  const stores = data?.stores;
  const onDataChange = useCallback((stampData: StampDisplayData | null) => {
    if (!stampData) clearStampSnapshot();
    else if (stores) rememberStampSnapshot({ userId, stores, stampData, fetchedAt: Date.now() });
  }, [userId, stores]);

  if (!data) return <StampLoading />;
  return <VisitStampCard stores={data.stores} initialStampData={data.stampData} onStampDataChange={value ? onDataChange : undefined} />;
}
