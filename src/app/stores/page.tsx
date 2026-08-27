import Link from "next/link";
import { ArrowLeft, Map, Utensils } from "lucide-react";
import { DISPLAY_STATUS } from "@/constants/crowd-status";
import { WAIT_TIME_BUCKET, WAIT_TIME_LABELS, WAIT_TIME_SCORE } from "@/constants/wait-time-options";
import { StoreSortSelect, type StoreSortOrder } from "@/components/stores/StoreSortSelect";
import { getStores } from "@/features/stores/store-queries";
import type { DisplayStatus, Store } from "@/features/stores/store-types";
import { cn, priceBandLabel } from "@/lib/utils";

const statusPriority: Record<DisplayStatus, number> = {
  available: 0,
  limited: 1,
  slightly_crowded: 2,
  unknown: 3,
  stale: 3,
  full: 4
};

function compareStores(a: Store, b: Store, sortOrder: StoreSortOrder) {
  const waitTimeDiff =
    sortOrder === "wait_desc"
      ? WAIT_TIME_SCORE[b.waitTime] - WAIT_TIME_SCORE[a.waitTime]
      : WAIT_TIME_SCORE[a.waitTime] - WAIT_TIME_SCORE[b.waitTime];
  if (waitTimeDiff !== 0) {
    return waitTimeDiff;
  }

  const statusDiff = statusPriority[a.status] - statusPriority[b.status];
  if (statusDiff !== 0) {
    return statusDiff;
  }

  return a.name.localeCompare(b.name, "ja");
}

export default async function StoresPage({
  searchParams
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const params = await searchParams;
  const sortOrder: StoreSortOrder = params.sort === "wait_desc" ? "wait_desc" : "wait_asc";
  const stores = [...getStores()].sort((a, b) => compareStores(a, b, sortOrder));

  return (
    <main className="min-h-dvh bg-slate-100 pb-24">
      <div className="px-3 pt-5">
      <div className="mb-4 flex items-center justify-between gap-3 px-1">
        <div>
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-bold text-slate-500">
            <ArrowLeft className="size-4" aria-hidden="true" />
            マップ
          </Link>
          <h1 className="mt-2 text-2xl font-black text-slate-950">店舗一覧</h1>
        </div>
      </div>

      <div className="mb-3 flex justify-end px-1">
        <StoreSortSelect value={sortOrder} />
      </div>

      <div className="overflow-hidden bg-white">
        {stores.map((store) => {
          const isFull = store.status === DISPLAY_STATUS.FULL;
          return (
          <Link
            key={store.id}
            href={`/stores/${store.id}`}
            className="grid grid-cols-[86px_1fr_auto] gap-3 border-b border-dashed border-slate-200 bg-white p-3 transition last:border-b-0 hover:bg-slate-50"
          >
            <div
              className="flex size-[86px] items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 via-emerald-100 to-cyan-100 shadow-inner"
            >
              <Utensils className="size-8 text-slate-500" aria-hidden="true" />
            </div>
            <div className="min-w-0 py-1">
              <h2 className="truncate text-base font-black text-blue-700">{store.name}</h2>
              <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">{store.description}</p>
              <p className="mt-1.5 text-xs font-bold text-slate-500">
                {store.genre} / {priceBandLabel(store.priceBand)}
              </p>
            </div>
            <div className="flex min-w-[86px] flex-col items-end justify-center">
              <span
                className={cn(
                  "text-right text-xl font-black leading-tight text-emerald-600",
                  store.waitTime === WAIT_TIME_BUCKET.NO_WAIT && "text-emerald-600",
                  store.waitTime === WAIT_TIME_BUCKET.WITHIN_5 && "text-emerald-600",
                  store.waitTime === WAIT_TIME_BUCKET.BETWEEN_5_10 && "text-cyan-700",
                  store.waitTime === WAIT_TIME_BUCKET.BETWEEN_10_20 && "text-orange-600",
                  store.waitTime === WAIT_TIME_BUCKET.OVER_20 && "text-slate-500"
                )}
              >
                {WAIT_TIME_LABELS[store.waitTime]}
              </span>
              {isFull ? <span className="mt-1 text-xs font-black text-red-500">満席</span> : null}
            </div>
          </Link>
          );
        })}
      </div>
      </div>

      <Link
        href="/"
        aria-label="マップへ戻る"
        className="fixed bottom-28 right-4 z-30 flex h-12 items-center gap-2 rounded-full border border-slate-950/10 bg-white/10 px-4 text-sm font-black text-slate-950 backdrop-blur-[2px] transition hover:bg-white/20"
      >
        <Map className="size-5" aria-hidden="true" />
        マップへ
      </Link>
    </main>
  );
}
