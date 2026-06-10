"use client";

import Link from "next/link";
import { Navigation, X } from "lucide-react";
import { StoreStatusBadge } from "@/components/stores/StoreStatusBadge";
import { WaitTimeLabel } from "@/components/stores/WaitTimeLabel";
import { Button } from "@/components/ui/button";
import type { Store } from "@/features/stores/store-types";
import { formatRelativeTime, priceBandLabel } from "@/lib/utils";

export function StoreBottomSheet({ store, onClose, compact = false }: { store: Store; onClose: () => void; compact?: boolean }) {
  return (
    <aside className={compact ? "absolute inset-x-3 bottom-24 z-30 rounded-lg border border-border bg-white p-4 shadow-panel md:bottom-6 md:left-auto md:right-6 md:w-96" : "absolute inset-x-4 bottom-4 z-20 rounded-lg border border-border bg-white p-4 shadow-panel md:left-auto md:w-96"}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-slate-950">{store.name}</h2>
            <StoreStatusBadge status={store.status} />
          </div>
          <p className="mt-1 text-sm text-slate-600">{store.genre} / {priceBandLabel(store.priceBand)}</p>
        </div>
        <button
          type="button"
          aria-label="閉じる"
          className="flex size-8 items-center justify-center rounded-md text-slate-500 hover:bg-muted"
          onClick={onClose}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      <p className="mt-3 text-sm text-slate-600">{store.description}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 rounded-md bg-muted p-3">
        <div>
          <p className="text-xs font-semibold text-slate-500">待ち時間目安</p>
          <div className="mt-1"><WaitTimeLabel waitTime={store.waitTime} /></div>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500">最終更新</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{formatRelativeTime(store.lastUpdatedAt)}</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button className="flex-1">
          <Navigation className="size-4" aria-hidden="true" />
          来店記録
        </Button>
        <Link
          href={`/stores/${store.id}`}
          className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-foreground ring-1 ring-border transition hover:bg-muted"
        >
          詳細
        </Link>
      </div>
    </aside>
  );
}
