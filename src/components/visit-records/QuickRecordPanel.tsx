"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { storeThumbnailImages } from "@/features/stores/store-thumbnail-images";
import { CheckCircle2, Utensils, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WaitTimeSelector } from "@/components/visit-records/WaitTimeSelector";
import type { StoreSummary, WaitTimeBucket } from "@/features/stores/store-types";
import { saveVisitRecord } from "@/features/visit-records/save-visit-record";
import { playStampSound } from "@/features/visit-records/stamp-sound";
import { cn } from "@/lib/utils";
import { prepareStampReward } from "@/features/visit-records/stamp-reward-loader";
import { StampRewardOverlay } from "@/components/visit-records/StampRewardOverlay";
import { useVisitLocation } from "@/features/visit-records/use-visit-location";
import {
  getVisitLocationButtonLabel,
  VisitLocationNotice
} from "@/components/visit-records/VisitLocationNotice";

export function QuickRecordPanel({ stores }: { stores: StoreSummary[] }) {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [waitTime, setWaitTime] = useState<WaitTimeBucket>("within_5");
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStampReward, setShowStampReward] = useState(false);
  const savingRef = useRef(false);
  const router = useRouter();
  const selectedStore = stores.find((store) => store.id === storeId) ?? null;
  const { canSaveWithLocation, location, locationMessage, requestLocation, status } = useVisitLocation(Boolean(selectedStore));

  const openWaitTimeSheet = (nextStoreId: string) => {
    if (savingRef.current) return;
    const store = stores.find(store => store.id === nextStoreId);
    if (store) prepareStampReward(store);
    setStoreId(nextStoreId);
    setWaitTime("within_5");
    setSaved(false);
    setError(null);
    setShowStampReward(false);
  };

  const closeWaitTimeSheet = () => {
    if (savingRef.current) return;
    setStoreId(null);
    setSaved(false);
    setError(null);
    setShowStampReward(false);
  };

  const saveRecord = async () => {
    if (!selectedStore || savingRef.current || saved) {
      return;
    }

    const recordLocation = location ?? await requestLocation();

    savingRef.current = true;
    setIsSaving(true);
    setError(null);
    setShowStampReward(true);
    try { playStampSound(); } catch { /* Audio failure must not interrupt saving. */ }

    try {
      const result = await saveVisitRecord({
        storeId: selectedStore.id,
        waitTime,
        location: recordLocation ?? undefined
      });
      if (result.crowdStatusUpdated === false) setError("スタンプは保存しましたが、待ち時間の更新に失敗しました。");
      setSaved(true);
      router.refresh();
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
      <section
        data-image-callout-disabled
        className="overflow-hidden bg-white"
        onContextMenu={(event) => event.preventDefault()}
        onDragStart={(event) => event.preventDefault()}
      >
        <div className="bg-gradient-to-br from-emerald-500 to-cyan-500 px-5 pb-6 pt-5 text-white">
          <p className="text-sm font-black opacity-80">待ち時間を記録</p>
          <h1 className="mt-1 text-3xl font-black tracking-normal">店を選ぶ</h1>
        </div>

        <div className="px-3 py-4">
          <div className="grid gap-2">
          {stores.map((store) => {
            const thumbnail = storeThumbnailImages[store.assetKey ?? store.id];
            const scale = thumbnail ? Math.min(64 / thumbnail.bounds.width, 64 / thumbnail.bounds.height) : 1;
            return (
            <button
              key={store.id}
              type="button"
              className={cn(
                "group grid grid-cols-[72px_1fr_auto] items-center gap-3 rounded-2xl bg-slate-50 p-2.5 text-left transition active:scale-[0.99] hover:bg-emerald-50",
                store.id === selectedStore?.id && "bg-emerald-50"
              )}
              onClick={() => openWaitTimeSheet(store.id)}
            >
              <span className={cn(
                "relative flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl",
                thumbnail ? "bg-white" : "bg-gradient-to-br from-orange-100 via-emerald-100 to-cyan-100 shadow-inner"
              )}>
                {thumbnail ? (
                  <Image
                    src={thumbnail.src}
                    alt=""
                    width={thumbnail.width}
                    height={thumbnail.height}
                    sizes="72px"
                    className="absolute max-w-none bg-white"
                    draggable={false}
                    style={{
                      width: thumbnail.width * scale,
                      height: thumbnail.height * scale,
                      left: (72 - thumbnail.bounds.width * scale) / 2 - thumbnail.bounds.x * scale,
                      top: (72 - thumbnail.bounds.height * scale) / 2 - thumbnail.bounds.y * scale
                    }}
                  />
                ) : (
                  <Utensils className="size-7 text-slate-500" aria-hidden="true" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block font-black text-slate-950">{store.name}</span>
                <span className="mt-0.5 block text-xs font-bold text-slate-500">{store.genre}</span>
              </span>
              <span className="flex size-8 items-center justify-center rounded-full bg-white text-slate-300 shadow-sm transition group-hover:bg-emerald-500 group-hover:text-white">
                <CheckCircle2 className="size-4" aria-hidden="true" />
              </span>
            </button>
          );
          })}
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
              disabled={isSaving || saved || status === "requesting" || status === "unavailable"}
            >
              {saved ? <CheckCircle2 className="size-5" aria-hidden="true" /> : null}
              {isSaving ? "保存中" : saved ? "記録しました" : getVisitLocationButtonLabel(status)}
            </Button>
            {!canSaveWithLocation ? <VisitLocationNotice status={status} message={locationMessage} /> : null}
            {error ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p> : null}
          </section>
        </div>
      ) : null}

      {selectedStore && showStampReward ? (
        <StampRewardOverlay store={selectedStore} isPending={isSaving} onClose={closeWaitTimeSheet} />
      ) : null}
    </>
  );
}
