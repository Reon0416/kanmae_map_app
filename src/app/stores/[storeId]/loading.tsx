import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function StoreDetailLoading() {
  return (
    <main className="min-h-dvh bg-slate-100 pb-24 pt-5 md:pb-10" aria-busy="true">
      <Link href="/stores" prefetch={false} className="inline-flex items-center gap-2 px-4 text-sm font-semibold text-slate-600">
        <ArrowLeft className="size-4" aria-hidden="true" />
        店舗一覧へ
      </Link>
      <section className="mt-5 grid gap-3 md:grid-cols-[1fr_340px] md:px-4" aria-label="店舗情報を読み込み中">
        <div className="bg-white">
          <div className="aspect-[3/1] w-full animate-pulse bg-slate-200" />
          <div className="space-y-4 p-6">
            <div className="h-5 w-20 animate-pulse rounded bg-slate-200" />
            <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
        <aside className="bg-white p-4">
          <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-200" />
        </aside>
      </section>
    </main>
  );
}
