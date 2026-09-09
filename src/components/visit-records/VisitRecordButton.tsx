"use client";

import { useState } from "react";
import { CheckCircle2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WaitTimeSelector } from "@/components/visit-records/WaitTimeSelector";
import type { Store, WaitTimeBucket } from "@/features/stores/store-types";
import { getCurrentPosition, saveVisitRecord } from "@/features/visit-records/save-visit-record";

export function VisitRecordButton({ store }: { store: Store }) {
  const [waitTime, setWaitTime] = useState<WaitTimeBucket>("within_5");
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveRecord() {
    setIsSaving(true);
    setError(null);

    const position = await getCurrentPosition();

    try {
      await saveVisitRecord({
        storeId: store.id,
        waitTime,
        location: position
          ? {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          : undefined
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
      <p className="mt-1 text-sm text-slate-600">{store.name}の近くにいる場合、待ち時間目安を選んで記録できます。</p>
      <div className="mt-4">
        <WaitTimeSelector value={waitTime} onChange={setWaitTime} />
      </div>
      <Button className="mt-4 w-full sm:w-auto" onClick={saveRecord} disabled={isSaving}>
        {saved ? <CheckCircle2 className="size-4" aria-hidden="true" /> : <Navigation className="size-4" aria-hidden="true" />}
        {isSaving ? "保存中" : saved ? "記録済み" : "来店記録を保存"}
      </Button>
      {error ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p> : null}
    </div>
  );
}
