import Link from "next/link";
import { Bookmark, List, Map, PenLine, Search } from "lucide-react";
import { StoreMap } from "@/components/map/StoreMap";
import { getStores } from "@/features/stores/store-queries";

const filters = ["空席あり", "満席を除外", "ラーメン", "800-1,200円"];

export default function HomePage() {
  const stores = getStores();

  return (
    <main className="relative h-dvh overflow-hidden bg-slate-900">
      <StoreMap stores={stores} fullscreen />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 bg-gradient-to-b from-black/35 via-black/10 to-transparent px-4 pb-16 pt-4">
        <div className="pointer-events-auto relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            className="h-11 w-full rounded-full border border-white/50 bg-white/95 pl-10 pr-4 text-sm font-semibold text-slate-900 shadow-panel outline-none transition focus:ring-2 focus:ring-slate-950"
            placeholder="店名・ジャンルで探す"
          />
        </div>
      </div>

      <Link
        href="/stores"
        aria-label="店舗一覧を開く"
        className="absolute bottom-28 right-4 z-30 flex h-12 items-center gap-2 rounded-full border border-slate-950/20 bg-white/26 px-4 text-sm font-black text-slate-950 shadow-sm backdrop-blur-md transition hover:bg-white/42"
      >
        <List className="size-5" aria-hidden="true" />
        店舗一覧
      </Link>

      <div className="absolute inset-x-0 bottom-0 z-40 border-t border-border bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="grid h-20 grid-cols-3 items-center">
          <Link href="/" className="flex flex-col items-center justify-center gap-1 text-xs font-black text-slate-950">
            <Map className="size-5" aria-hidden="true" />
            マップ
          </Link>
          <Link
            href="/record"
            className="-mt-7 flex flex-col items-center justify-center gap-1 text-xs font-black text-emerald-700"
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-panel ring-8 ring-white">
              <PenLine className="size-7" aria-hidden="true" />
            </span>
            記録
          </Link>
          <Link href="/favorites" className="flex flex-col items-center justify-center gap-1 text-xs font-black text-slate-500">
            <Bookmark className="size-5" aria-hidden="true" />
            保存
          </Link>
        </div>
      </div>

      <div className="pointer-events-auto absolute left-4 top-[4.75rem] z-20 flex max-w-full gap-2 overflow-x-auto pr-4">
        {filters.map((filter) => (
          <button key={filter} className="h-9 shrink-0 rounded-full bg-white/95 px-3 text-xs font-black text-slate-800 shadow-sm">
            {filter}
          </button>
        ))}
      </div>
    </main>
  );
}
