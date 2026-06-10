"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, MapPin, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WaitTimeSelector } from "@/components/visit-records/WaitTimeSelector";
import type { Store, WaitTimeBucket } from "@/features/stores/store-types";
import { cn } from "@/lib/utils";

export function QuickRecordPanel({ stores }: { stores: Store[] }) {
  const [storeId, setStoreId] = useState(stores[0]?.id);
  const [waitTime, setWaitTime] = useState<WaitTimeBucket>("within_5");
  const [saved, setSaved] = useState(false);
  const selectedStore = stores.find((store) => store.id === storeId) ?? stores[0];

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
            <PenLine className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-black text-slate-950">すぐ記録</h1>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              今いる店を選んで、待ち時間目安だけ記録できます。
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-black text-slate-500">店舗を選択</h2>
        <div className="mt-3 grid gap-2">
          {stores.map((store) => (
            <button
              key={store.id}
              type="button"
              className={cn(
                "flex items-center justify-between gap-3 rounded-md border border-border bg-white p-3 text-left transition",
                store.id === selectedStore?.id && "border-emerald-500 bg-emerald-50"
              )}
              onClick={() => {
                setStoreId(store.id);
                setSaved(false);
              }}
            >
              <span>
                <span className="block font-black text-slate-950">{store.name}</span>
                <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
                  <MapPin className="size-3" aria-hidden="true" />
                  徒歩{store.walkMinutes}分 / {store.genre}
                </span>
              </span>
              {store.id === selectedStore?.id ? <CheckCircle2 className="size-5 text-emerald-600" aria-hidden="true" /> : null}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-black text-slate-500">待ち時間目安</h2>
        <div className="mt-3">
          <WaitTimeSelector value={waitTime} onChange={setWaitTime} />
        </div>
        <Button className="mt-4 h-12 w-full bg-emerald-500 text-base hover:bg-emerald-600" onClick={() => setSaved(true)}>
          {saved ? <CheckCircle2 className="size-5" aria-hidden="true" /> : <PenLine className="size-5" aria-hidden="true" />}
          {saved ? "記録しました" : "この内容で記録"}
        </Button>
        {selectedStore ? (
          <Link href={`/stores/${selectedStore.id}`} className="mt-3 block text-center text-sm font-bold text-slate-500">
            {selectedStore.name}の詳細を見る
          </Link>
        ) : null}
      </section>
    </div>
  );
}
