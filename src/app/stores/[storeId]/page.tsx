import Image from "next/image";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { StoreDetailRecordSheet } from "@/components/stores/StoreDetailRecordSheet";
import { CachedStoreStatus } from "@/components/stores/CachedStoreStatus";
import { getStoreInfoById, getStoreLiveStatus } from "@/features/stores/store-queries";
import { getStoreDisplayGenre } from "@/features/stores/store-display-genre";

async function LiveStoreStatus({ storeId, field }: { storeId: string; field: "badge" | "waitTime" | "updatedAt" }) {
  try {
    const status = await getStoreLiveStatus(storeId);
    return <CachedStoreStatus storeId={storeId} field={field} value={status ? { id: storeId, ...status, lastUpdatedAt: status.lastUpdatedAt ?? "", fetchedAt: Date.now() } : null} />;
  } catch {
    return <CachedStoreStatus storeId={storeId} field={field} failed />;
  }
}

export default async function StoreDetailPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const store = await getStoreInfoById(storeId);

  if (!store) notFound();
  const genre = getStoreDisplayGenre(store);

  return (
    <main className="min-h-dvh bg-slate-100 pb-24 pt-5 md:pb-10">
      <Link href="/stores" prefetch={false} className="inline-flex items-center gap-2 px-4 text-sm font-semibold text-slate-600 hover:text-slate-950">
        <ArrowLeft className="size-4" aria-hidden="true" />
        店舗一覧へ
      </Link>
      <section className="mt-5 grid gap-3 md:grid-cols-[1fr_340px] md:px-4">
        <div className="overflow-hidden bg-white md:rounded-lg md:shadow-sm">
          {store.heroImage ? (
            <div className="relative aspect-[3/1] w-full bg-white">
              <Image
                src={store.heroImage}
                alt={`${store.name}の看板`}
                fill
                priority
                quality={100}
                sizes="(max-width: 768px) 100vw, 720px"
                className="object-contain"
              />
            </div>
          ) : null}
          <div className={`${store.heroImage ? "p-6" : "flex min-h-64 items-end bg-[linear-gradient(135deg,#dbeafe,#dcfce7_48%,#fef3c7)] p-6"}`}>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Suspense fallback={<CachedStoreStatus storeId={store.id} field="badge" />}><LiveStoreStatus storeId={store.id} field="badge" /></Suspense>
                {store.hasStudentDiscount ? <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-700">学割あり</span> : null}
              </div>
              <h1 className="mt-3 text-3xl font-black text-slate-950">{store.name}</h1>
              <p className="mt-2 max-w-xl text-sm font-semibold text-slate-700">{genre}</p>
            </div>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-3">
            <div>
              <p className="text-xs font-bold text-slate-500">待ち時間目安</p>
              <div className="mt-2"><Suspense fallback={<CachedStoreStatus storeId={store.id} field="waitTime" />}><LiveStoreStatus storeId={store.id} field="waitTime" /></Suspense></div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500">ジャンル</p>
              <p className="mt-2 text-sm font-semibold">{genre}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500">最終更新</p>
              <p className="mt-2 text-sm font-semibold"><Suspense fallback={<CachedStoreStatus storeId={store.id} field="updatedAt" />}><LiveStoreStatus storeId={store.id} field="updatedAt" /></Suspense></p>
            </div>
          </div>
        </div>
        <aside className="space-y-4">
          <div className="bg-white p-4 md:rounded-lg md:shadow-sm">
            <h2 className="text-base font-bold">店舗情報</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-slate-500">営業時間</dt><dd className="font-semibold">{store.hours}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">定休日</dt><dd className="font-semibold">{store.closed}</dd></div>
            </dl>
          </div>
        </aside>
      </section>
      <StoreDetailRecordSheet store={store} />
    </main>
  );
}
