"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OPEN_STORE_DETAIL_RECORD_EVENT } from "@/features/visit-records/record-events";
import { WaitTimeSelector } from "@/components/visit-records/WaitTimeSelector";
import type { Store, WaitTimeBucket } from "@/features/stores/store-types";
import { saveVisitRecord } from "@/features/visit-records/save-visit-record";
import { playStampSound } from "@/features/visit-records/stamp-sound";
import { prepareStampReward } from "@/features/visit-records/stamp-reward-loader";
import { StampRewardOverlay } from "@/components/visit-records/StampRewardOverlay";
import { useVisitLocation } from "@/features/visit-records/use-visit-location";

export { OPEN_STORE_DETAIL_RECORD_EVENT } from "@/features/visit-records/record-events";

function isOwnerWaitTimeLocked(store: Store) {
  if (!store.ownerWaitTimeLockUntil) return false;
  const lockUntil = new Date(store.ownerWaitTimeLockUntil).getTime();
  return !Number.isNaN(lockUntil) && lockUntil > Date.now();
}

function getOwnerWaitTimeLockRemainingMs(store: Store) {
  if (!store.ownerWaitTimeLockUntil) return 0;
  const lockUntil = new Date(store.ownerWaitTimeLockUntil).getTime();
  if (Number.isNaN(lockUntil)) return 0;
  return Math.max(0, lockUntil - Date.now());
}

function OfficialVacancyCallout() {
  return (
    <div className="grid grid-cols-[4.5rem_1fr] items-center gap-4 rounded-2xl border border-amber-200 bg-white px-4 py-4 shadow-sm">
      <span className="flex size-16 items-center justify-center rounded-full bg-amber-100 text-slate-950" aria-hidden="true">
        <svg viewBox="0 0 64 64" className="size-11 fill-current">
          <circle cx="24" cy="11" r="7" />
          <path d="M23 21c2.2-2.8 6.4-3.1 9-.8l7.4 6.6 8.5 1.8c2.2.5 3.6 2.6 3.1 4.8-.5 2.1-2.6 3.5-4.7 3l-9.4-2c-.7-.1-1.4-.5-2-.9l-3.8-3.4-5.5 8.6 7.9 6.3c1 .8 1.6 1.9 1.7 3.2l.7 9.2c.2 2.4-1.6 4.4-4 4.6-2.3.2-4.4-1.6-4.6-4l-.6-7.4-10.1-8c-2.5-2-3.1-5.5-1.4-8.2L23 21Z" />
          <path d="M14.6 29.2 6.8 27c-2.2-.6-3.4-2.9-2.8-5 .6-2.2 2.9-3.4 5-2.8l9.6 2.7c1.1.3 2 1.1 2.6 2l2.4 4-5.4 8.4-3.6-7.1ZM19.7 42.9l-5.5 2.8-4.5 9.3c-1 2.1-3.5 3-5.6 2-2.1-1-3-3.5-2-5.6l5.1-10.5c.4-.8 1.1-1.5 1.9-1.9l7.7-4 2.9 7.9Z" />
        </svg>
      </span>
      <div>
        <p className="text-lg font-black leading-tight text-slate-950">今ならすぐ入れます</p>
        <p className="mt-1 text-sm font-black text-amber-700">空席のうちに向かおう</p>
      </div>
    </div>
  );
}

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
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStampReward, setShowStampReward] = useState(false);
  const [, setLockTick] = useState(0);
  const savingRef = useRef(false);
  const { canSaveWithLocation, location, locationMessage, requestLocation, status } = useVisitLocation(isOpen);
  const ownerWaitTimeLocked = isOwnerWaitTimeLocked(store);

  useEffect(() => {
    if (isOpen) {
      setWaitTime("within_5");
      setSaved(false);
      setError(null);
      setShowStampReward(false);
    }
  }, [isOpen, store.id]);

  useEffect(() => {
    if (isOpen) prepareStampReward({ id: store.id, name: store.name, assetKey: store.assetKey });
  }, [isOpen, store.id, store.name, store.assetKey]);

  useEffect(() => {
    if (!isOpen || getOwnerWaitTimeLockRemainingMs(store) <= 0) return;
    const intervalId = window.setInterval(() => setLockTick((tick) => tick + 1), 1000);
    return () => window.clearInterval(intervalId);
  }, [isOpen, store]);

  const closeSheet = () => {
    if (savingRef.current) return;
    setSaved(false);
    setError(null);
    setShowStampReward(false);
    onClose();
  };

  const saveRecord = async () => {
    if (savingRef.current || saved) return;
    if (!location) {
      setError("位置情報を取得してから記録してください。");
      requestLocation();
      return;
    }

    savingRef.current = true;
    setIsSaving(true);
    setError(null);
    setShowStampReward(true);
    try { playStampSound(); } catch { /* Audio failure must not interrupt saving. */ }

    try {
      const result = await saveVisitRecord({
        storeId: store.id,
        waitTime: ownerWaitTimeLocked ? "no_wait" : waitTime,
        location
      });
      if (result.crowdStatusUpdated === false) setError("スタンプは保存しましたが、待ち時間の更新に失敗しました。");
      setSaved(true);
    } catch (saveError) {
      setShowStampReward(false);
      setError(saveError instanceof Error ? saveError.message : "来店記録を保存できませんでした。");
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
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
              {ownerWaitTimeLocked ? (
                <OfficialVacancyCallout />
              ) : (
                <WaitTimeSelector value={waitTime} onChange={setWaitTime} />
              )}
            </div>

            <Button
              className="mt-5 h-14 w-full rounded-2xl bg-emerald-500 text-base font-black text-white shadow-[0_16px_34px_rgba(16,185,129,0.35)] hover:bg-emerald-600"
              onClick={saveRecord}
              disabled={isSaving || saved || !canSaveWithLocation}
            >
              {saved ? <CheckCircle2 className="size-5" aria-hidden="true" /> : null}
              {isSaving
                ? "保存中"
                : saved
                  ? "記録しました"
                  : canSaveWithLocation
                    ? ownerWaitTimeLocked ? "スタンプを押す" : "記録する"
                    : "位置情報を取得してください"}
            </Button>
            {!canSaveWithLocation ? (
              <div className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">
                <p>{locationMessage}</p>
                {status === "denied" || status === "failed" ? (
                  <button type="button" className="mt-2 underline underline-offset-4" onClick={requestLocation}>
                    もう一度取得する
                  </button>
                ) : null}
              </div>
            ) : null}
            {error ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p> : null}
          </section>
        </div>
      ) : null}

      {showStampReward ? <StampRewardOverlay store={store} isPending={isSaving} onClose={closeSheet} /> : null}
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
