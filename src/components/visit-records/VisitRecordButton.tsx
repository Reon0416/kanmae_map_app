"use client";

import { useState } from "react";
import { CheckCircle2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WaitTimeSelector } from "@/components/visit-records/WaitTimeSelector";
import type { Store, WaitTimeBucket } from "@/features/stores/store-types";
import { saveVisitRecord } from "@/features/visit-records/save-visit-record";
import { useVisitLocation } from "@/features/visit-records/use-visit-location";

export function VisitRecordButton({ store }: { store: Store }) {
  const [waitTime, setWaitTime] = useState<WaitTimeBucket>("within_5");
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { canSaveWithLocation, location, locationMessage, requestLocation, status } = useVisitLocation();

  async function saveRecord() {
    if (!location) {
      setError("位置情報を取得してから記録してください。");
      requestLocation();
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await saveVisitRecord({
        storeId: store.id,
        waitTime,
        location
      });
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "来店記録を保存できませんでした。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="bg-white p-4 md:rounded-lg">
      <h2 className="text-base font-bold text-slate-950">来店記録</h2>
      <p className="mt-1 text-sm text-slate-600">{store.name}の待ち時間目安を選んで記録できます。</p>
      <div className="mt-4">
        <WaitTimeSelector value={waitTime} onChange={setWaitTime} />
      </div>
      <Button className="mt-4 w-full sm:w-auto" onClick={saveRecord} disabled={isSaving || !canSaveWithLocation}>
        {saved ? <CheckCircle2 className="size-4" aria-hidden="true" /> : <Navigation className="size-4" aria-hidden="true" />}
        {isSaving ? "保存中" : saved ? "記録済み" : canSaveWithLocation ? "来店記録を保存" : "位置情報を取得してください"}
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
    </div>
  );
}
