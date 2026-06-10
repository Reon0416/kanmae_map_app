import Link from "next/link";
import { ArrowLeft, Map, MapPin } from "lucide-react";
import { StoreStatusBadge } from "@/components/stores/StoreStatusBadge";
import { WaitTimeLabel } from "@/components/stores/WaitTimeLabel";
import { getStores } from "@/features/stores/store-queries";
import { formatRelativeTime, priceBandLabel } from "@/lib/utils";

export default function StoresPage() {
  const stores = getStores();

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-5">
      <div className="mb-5 flex items-center justify-between gap-3">
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

      <div className="grid gap-3">
        {stores.map((store) => (
          <Link
            key={store.id}
            href={`/stores/${store.id}`}
            className="rounded-lg border border-border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-black text-slate-950">{store.name}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  {store.genre} / {priceBandLabel(store.priceBand)}
                </p>
              </div>
              <StoreStatusBadge status={store.status} />
            </div>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{store.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <WaitTimeLabel waitTime={store.waitTime} />
              <span className="inline-flex items-center gap-1 font-semibold">
                <MapPin className="size-4" aria-hidden="true" />
                徒歩{store.walkMinutes}分
              </span>
              <span className="font-semibold">更新 {formatRelativeTime(store.lastUpdatedAt)}</span>
            </div>
          </Link>
        ))}
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
