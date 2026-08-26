import Link from "next/link";
import { ArrowLeft, Map, Utensils } from "lucide-react";
import { DISPLAY_STATUS } from "@/constants/crowd-status";
import { WAIT_TIME_BUCKET, WAIT_TIME_LABELS, WAIT_TIME_SCORE } from "@/constants/wait-time-options";
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

function isLowPriorityStore(store: Store) {
  return store.status === DISPLAY_STATUS.FULL || store.waitTime === WAIT_TIME_BUCKET.OVER_20;
}

function compareStores(a: Store, b: Store) {
  const lowPriorityDiff = Number(isLowPriorityStore(a)) - Number(isLowPriorityStore(b));
  if (lowPriorityDiff !== 0) {
    return lowPriorityDiff;
  }

  const statusDiff = statusPriority[a.status] - statusPriority[b.status];
  if (statusDiff !== 0) {
    return statusDiff;
  }

  const waitTimeDiff = WAIT_TIME_SCORE[a.waitTime] - WAIT_TIME_SCORE[b.waitTime];
  if (waitTimeDiff !== 0) {
    return waitTimeDiff;
  }

  return a.name.localeCompare(b.name, "ja");
}

export default function StoresPage() {
  const stores = [...getStores()].sort(compareStores);

  return (
    <main className="min-h-dvh bg-slate-100 pb-24">
      <div className="px-3 pt-5">
      <div className="mb-5 flex items-center justify-between gap-3 px-1">
        <div>
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-bold text-slate-500">
            <ArrowLeft className="size-4" aria-hidden="true" />
            マップ
          </Link>
          <h1 className="mt-2 text-2xl font-black text-slate-950">店舗一覧</h1>
        </div>
        <Link href="/record" className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-black text-white shadow-sm">
          記録する
        </Link>
      </div>

      <div className="overflow-hidden bg-white">
        {stores.map((store) => {
          const lowPriority = isLowPriorityStore(store);
          return (
          <Link
            key={store.id}
            href={`/stores/${store.id}`}
            className={cn(
              "grid grid-cols-[86px_1fr_auto] gap-3 border-b border-dashed border-slate-200 bg-white p-3 transition last:border-b-0 hover:bg-slate-50",
              lowPriority && "bg-slate-100/80 opacity-55 grayscale-[0.25] hover:bg-slate-100"
            )}
          >
            <div
              className={cn(
                "flex size-[86px] items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 via-emerald-100 to-cyan-100 shadow-inner",
                lowPriority && "from-slate-100 via-slate-100 to-slate-200"
              )}
            >
              <Utensils className={cn("size-8 text-slate-500", lowPriority && "text-slate-400")} aria-hidden="true" />
            </div>
            <div className="min-w-0 py-1">
              <h2 className={cn("truncate text-base font-black text-blue-700", lowPriority && "text-slate-600")}>{store.name}</h2>
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
