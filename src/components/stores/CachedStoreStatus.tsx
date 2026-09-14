"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { StoreStatusBadge } from "@/components/stores/StoreStatusBadge";
import { WaitTimeLabel } from "@/components/stores/WaitTimeLabel";
import { readStoreStatusSnapshot, rememberStoreStatuses, subscribeStoreStatuses, type StoreStatusSnapshot } from "@/features/stores/store-status-snapshot";
import { formatRelativeTime } from "@/lib/utils";

const emptyServerSnapshot = () => null;

export function StoreStatusCache({ statuses }: { statuses: StoreStatusSnapshot[] }) {
  useEffect(() => { rememberStoreStatuses(statuses); }, [statuses]);
  return null;
}

export function CachedStoreStatus({ storeId, field, value, failed = false }: {
  storeId: string;
  field: "badge" | "waitTime" | "updatedAt";
  value?: StoreStatusSnapshot | null;
  failed?: boolean;
}) {
  const getSnapshot = useCallback(() => readStoreStatusSnapshot(storeId), [storeId]);
  const cached = useSyncExternalStore(subscribeStoreStatuses, getSnapshot, emptyServerSnapshot);
  useEffect(() => { if (value) rememberStoreStatuses([value]); }, [value]);
  const status = value !== undefined ? value : cached;
  if (!status) {
    if (failed || value === null) {
      return field === "badge" ? <StoreStatusBadge status="unknown" /> : <span className="text-sm text-slate-500">{failed ? "取得できませんでした" : "未確認"}</span>;
    }
    return <span className="inline-block h-5 w-20 animate-pulse rounded bg-slate-200" aria-label="読み込み中" />;
  }
  return (
    <span title={value === undefined ? failed ? "前回取得した情報です。最新情報を取得できませんでした。" : "前回取得した情報です。最新情報を確認中です。" : undefined}>
      {field === "badge" ? <StoreStatusBadge status={status.status} /> : field === "waitTime" ? <WaitTimeLabel waitTime={status.waitTime} /> : formatRelativeTime(status.lastUpdatedAt)}
    </span>
  );
}
