import Link from "next/link";
import { ArrowLeft, Clock3, Map, Utensils } from "lucide-react";
import { STATUS_LABELS } from "@/constants/crowd-status";
import { WAIT_TIME_LABELS } from "@/constants/wait-time-options";
import { getStores } from "@/features/stores/store-queries";
import type { DisplayStatus } from "@/features/stores/store-types";
import { cn, priceBandLabel } from "@/lib/utils";

const statusStyles: Record<DisplayStatus, string> = {
  available: "bg-emerald-500 text-white",
  limited: "bg-yellow-400 text-yellow-950",
  slightly_crowded: "bg-orange-500 text-white",
  full: "bg-red-500 text-white",
  stale: "bg-slate-500 text-white",
  unknown: "bg-slate-400 text-white"
};

export default function StoresPage() {
  const stores = getStores();

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
        {stores.map((store) => (
          <Link
            key={store.id}
            href={`/stores/${store.id}`}
            className="grid grid-cols-[86px_1fr_auto] gap-3 border-b border-dashed border-slate-200 bg-white p-3 transition last:border-b-0 hover:bg-slate-50"
          >
            <div className="flex size-[86px] items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 via-emerald-100 to-cyan-100 shadow-inner">
              <Utensils className="size-8 text-slate-500" aria-hidden="true" />
            </div>
            <div className="min-w-0 py-1">
              <h2 className="truncate text-base font-black text-blue-700">{store.name}</h2>
              <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">{store.description}</p>
              <p className="mt-1.5 text-xs font-bold text-slate-500">
                {store.genre} / {priceBandLabel(store.priceBand)}
              </p>
            </div>
            <div className="flex min-w-[82px] flex-col items-end justify-center gap-2">
              <span className={cn("rounded-full px-2.5 py-1 text-xs font-black shadow-sm", statusStyles[store.status])}>
                {STATUS_LABELS[store.status]}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-2.5 py-1 text-sm font-black text-white shadow-sm">
                <Clock3 className="size-3.5" aria-hidden="true" />
                {WAIT_TIME_LABELS[store.waitTime].replace("分以内", "分").replace("分以上", "分+")}
              </span>
            </div>
          </Link>
        ))}
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
