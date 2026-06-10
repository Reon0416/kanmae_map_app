"use client";

import type { Store } from "@/features/stores/store-types";
import { WAIT_TIME_LABELS } from "@/constants/wait-time-options";
import { cn } from "@/lib/utils";
import Link from "next/link";

const markerStyles: Record<Store["status"], string> = {
  available: "bg-emerald-500 ring-emerald-200",
  limited: "bg-yellow-500 ring-yellow-200",
  slightly_crowded: "bg-orange-500 ring-orange-200",
  full: "bg-red-500 ring-red-200",
  stale: "bg-slate-400 ring-slate-200",
  unknown: "bg-slate-400 ring-slate-200"
};

export function StoreMarker({
  store
}: {
  store: Store;
}) {
  return (
    <Link
      href={`/stores/${store.id}`}
      aria-label={`${store.name}の詳細を見る`}
      className={cn(
        "absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white px-3 py-2 text-center text-slate-950 shadow-panel transition after:absolute after:left-1/2 after:top-full after:-ml-2 after:border-x-8 after:border-t-8 after:border-x-transparent after:border-t-white hover:scale-105"
      )}
      style={{ left: `${store.mapPosition.x}%`, top: `${store.mapPosition.y}%` }}
    >
      <span className={cn("mx-auto mb-1 block size-2 rounded-full", markerStyles[store.status].split(" ")[0])} />
      <span className="block text-lg font-black leading-none">{WAIT_TIME_LABELS[store.waitTime].replace("分以内", "").replace("分以上", "+")}</span>
      <span className="mt-0.5 block text-[11px] font-bold leading-none text-slate-600">待ち</span>
    </Link>
  );
}
