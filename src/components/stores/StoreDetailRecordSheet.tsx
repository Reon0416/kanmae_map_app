"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StampRewardOverlay } from "@/components/visit-records/StampRewardOverlay";
import { WaitTimeSelector } from "@/components/visit-records/WaitTimeSelector";
import type { Store, WaitTimeBucket } from "@/features/stores/store-types";
import { saveLocalVisitRecord } from "@/features/visit-records/local-visit-records";

export const OPEN_STORE_DETAIL_RECORD_EVENT = "kanmae:open-store-detail-record";

export function StoreRecordSheet({
  store,
  isOpen,
  onClose
}: {
  store: Store;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [waitTime, setWaitTime] = useState<WaitTimeBucket>("within_5");
  const [saved, setSaved] = useState(false);
  const [showStampReward, setShowStampReward] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setWaitTime("within_5");
      setSaved(false);
      setShowStampReward(false);
    }
  }, [isOpen, store.id]);

  const closeSheet = () => {
    setSaved(false);
    setShowStampReward(false);
    onClose();
  };

  const saveRecord = () => {
    saveLocalVisitRecord({
      storeId: store.id,
      storeName: store.name,
      waitTime
    });
    setSaved(true);
    setShowStampReward(true);
  };

  return (
    <>
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/58 px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-8 backdrop-blur-sm sm:items-center">
          <section className="w-full max-w-md rounded-[30px] bg-white p-4 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
            <div className="flex items-start justify-between gap-3 px-1 pt-1">
              <div>
                <p className="text-xs font-black text-emerald-600">待ち時間を記録</p>
                <h2 className="mt-0.5 text-2xl font-black text-slate-950">{store.name}</h2>
              </div>
              <button
                type="button"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                onClick={closeSheet}
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

      {showStampReward ? <StampRewardOverlay store={store} onClose={closeSheet} /> : null}
    </>
  );
}

export function StoreDetailRecordSheet({ store }: { store: Store }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const openSheet = () => setIsOpen(true);

    window.addEventListener(OPEN_STORE_DETAIL_RECORD_EVENT, openSheet);
    return () => window.removeEventListener(OPEN_STORE_DETAIL_RECORD_EVENT, openSheet);
  }, []);

  return <StoreRecordSheet store={store} isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}
