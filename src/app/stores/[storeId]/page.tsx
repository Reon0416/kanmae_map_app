import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { StoreDetailRecordSheet } from "@/components/stores/StoreDetailRecordSheet";
import { StoreStatusBadge } from "@/components/stores/StoreStatusBadge";
import { WaitTimeLabel } from "@/components/stores/WaitTimeLabel";
import { getStoreById } from "@/features/stores/store-queries";
import { formatRelativeTime, priceBandLabel } from "@/lib/utils";

export default async function StoreDetailPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const store = getStoreById(storeId);

  if (!store) notFound();

  return (
    <main className="min-h-dvh bg-slate-100 pb-24 pt-5 md:pb-10">
      <Link href="/" className="inline-flex items-center gap-2 px-4 text-sm font-semibold text-slate-600 hover:text-slate-950">
        <ArrowLeft className="size-4" aria-hidden="true" />
        マップへ戻る
      </Link>
      <section className="mt-5 grid gap-3 md:grid-cols-[1fr_340px] md:px-4">
        <div className="overflow-hidden bg-white md:rounded-lg md:shadow-sm">
          <div className="flex min-h-64 items-end bg-[linear-gradient(135deg,#dbeafe,#dcfce7_48%,#fef3c7)] p-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StoreStatusBadge status={store.status} />
                {store.hasStudentDiscount ? <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-700">学割あり</span> : null}
              </div>
              <h1 className="mt-3 text-3xl font-black text-slate-950">{store.name}</h1>
              <p className="mt-2 max-w-xl text-sm font-semibold text-slate-700">{store.description}</p>
            </div>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-3">
            <div>
              <p className="text-xs font-bold text-slate-500">待ち時間目安</p>
              <div className="mt-2"><WaitTimeLabel waitTime={store.waitTime} /></div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500">ジャンル・価格</p>
              <p className="mt-2 text-sm font-semibold">{store.genre} / {priceBandLabel(store.priceBand)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500">最終更新</p>
              <p className="mt-2 text-sm font-semibold">{formatRelativeTime(store.lastUpdatedAt)}</p>
            </div>
          </div>
        </div>
        <aside className="space-y-4">
          <div className="bg-white p-4 md:rounded-lg md:shadow-sm">
            <h2 className="text-base font-bold">店舗情報</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-slate-500">営業時間</dt><dd className="font-semibold">{store.hours}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">定休日</dt><dd className="font-semibold">{store.closed}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">テイクアウト</dt><dd className="font-semibold">{store.acceptsTakeout ? "可" : "不可"}</dd></div>
            </dl>
            <div className="mt-4 rounded-md bg-muted p-3 text-sm font-semibold text-slate-700">{store.address}</div>
          </div>
        </aside>
      </section>
      <StoreDetailRecordSheet store={store} />
    </main>
  );
}
