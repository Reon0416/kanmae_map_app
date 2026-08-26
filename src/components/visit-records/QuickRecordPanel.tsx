"use client";

import { useState } from "react";
import { CheckCircle2, Search, Utensils, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StampRewardOverlay } from "@/components/visit-records/StampRewardOverlay";
import { WaitTimeSelector } from "@/components/visit-records/WaitTimeSelector";
import type { Store, WaitTimeBucket } from "@/features/stores/store-types";
import { saveLocalVisitRecord } from "@/features/visit-records/local-visit-records";
import { cn } from "@/lib/utils";

export function QuickRecordPanel({ stores }: { stores: Store[] }) {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [waitTime, setWaitTime] = useState<WaitTimeBucket>("within_5");
  const [saved, setSaved] = useState(false);
  const [showStampReward, setShowStampReward] = useState(false);
  const selectedStore = stores.find((store) => store.id === storeId) ?? null;

  const openWaitTimeSheet = (nextStoreId: string) => {
    setStoreId(nextStoreId);
    setWaitTime("within_5");
    setSaved(false);
    setShowStampReward(false);
  };

  const closeWaitTimeSheet = () => {
    setStoreId(null);
    setSaved(false);
    setShowStampReward(false);
  };

  const saveRecord = () => {
    if (!selectedStore) {
      return;
    }

    saveLocalVisitRecord({
      storeId: selectedStore.id,
      storeName: selectedStore.name,
      waitTime
    });
    setSaved(true);
    setShowStampReward(true);
  };

  return (
    <>
      <section className="overflow-hidden bg-white">
        <div className="bg-gradient-to-br from-emerald-500 to-cyan-500 px-5 pb-6 pt-5 text-white">
          <p className="text-sm font-black opacity-80">待ち時間を記録</p>
          <h1 className="mt-1 text-3xl font-black tracking-normal">店を選ぶ</h1>
        </div>

        <div className="px-3 py-4">
          <div className="grid gap-2">
          {stores.map((store) => (
            <button
              key={store.id}
              type="button"
              className={cn(
                "group grid grid-cols-[72px_1fr_auto] items-center gap-3 rounded-2xl bg-slate-50 p-2.5 text-left transition active:scale-[0.99] hover:bg-emerald-50",
                store.id === selectedStore?.id && "bg-emerald-50"
              )}
              onClick={() => openWaitTimeSheet(store.id)}
            >
              <span className="flex size-[72px] items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 via-emerald-100 to-cyan-100 shadow-inner">
                <Utensils className="size-7 text-slate-500" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block font-black text-slate-950">{store.name}</span>
                <span className="mt-0.5 block text-xs font-bold text-slate-500">{store.genre}</span>
              </span>
              <span className="flex size-8 items-center justify-center rounded-full bg-white text-slate-300 shadow-sm transition group-hover:bg-emerald-500 group-hover:text-white">
                <CheckCircle2 className="size-4" aria-hidden="true" />
              </span>
            </button>
          ))}
          </div>
        </div>
      </section>

      {selectedStore ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/58 px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-8 backdrop-blur-sm sm:items-center">
          <section className="w-full max-w-md rounded-[30px] bg-white p-4 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
            <div className="flex items-start justify-between gap-3 px-1 pt-1">
              <div>
                <p className="text-xs font-black text-emerald-600">選択中</p>
                <h2 className="mt-0.5 text-2xl font-black text-slate-950">{selectedStore.name}</h2>
              </div>
              <button
                type="button"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                onClick={closeWaitTimeSheet}
                aria-label="閉じる"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5">
              <WaitTimeSelector value={waitTime} onChange={setWaitTime} />
            </div>

            <Button
              className="mt-5 h-14 w-full rounded-2xl bg-emerald-500 text-base font-black text-white shadow-[0_16px_34px_rgba(16,185,129,0.35)] hover:bg-emerald-600"
              onClick={saveRecord}
            >
              {saved ? <CheckCircle2 className="size-5" aria-hidden="true" /> : null}
              {saved ? "記録しました" : "記録する"}
            </Button>
          </section>
        </div>
      ) : null}

      {selectedStore && showStampReward ? (
        <StampRewardOverlay store={selectedStore} onClose={closeWaitTimeSheet} />
      ) : null}
    </>
  );
}
