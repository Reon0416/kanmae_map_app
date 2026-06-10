import Link from "next/link";
import { MapPin } from "lucide-react";
import { StoreStatusBadge } from "@/components/stores/StoreStatusBadge";
import { WaitTimeLabel } from "@/components/stores/WaitTimeLabel";
import type { Store } from "@/features/stores/store-types";
import { formatRelativeTime, priceBandLabel } from "@/lib/utils";

export function StoreCard({ store }: { store: Store }) {
  return (
    <Link
      href={`/stores/${store.id}`}
      className="block rounded-lg border border-border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-950">{store.name}</h3>
          <p className="mt-1 text-sm text-slate-600">{store.genre} / {priceBandLabel(store.priceBand)}</p>
        </div>
        <StoreStatusBadge status={store.status} />
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-slate-600">{store.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <WaitTimeLabel waitTime={store.waitTime} />
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-4" aria-hidden="true" />
          徒歩{store.walkMinutes}分
        </span>
        <span>最終更新 {formatRelativeTime(store.lastUpdatedAt)}</span>
      </div>
    </Link>
  );
}
