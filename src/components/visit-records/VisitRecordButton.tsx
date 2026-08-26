"use client";

import { useState } from "react";
import { CheckCircle2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WaitTimeSelector } from "@/components/visit-records/WaitTimeSelector";
import type { Store, WaitTimeBucket } from "@/features/stores/store-types";

export function VisitRecordButton({ store }: { store: Store }) {
  const [waitTime, setWaitTime] = useState<WaitTimeBucket>("within_5");
  const [saved, setSaved] = useState(false);

  return (
    <div className="bg-white p-4 md:rounded-lg">
      <h2 className="text-base font-bold text-slate-950">来店記録</h2>
      <p className="mt-1 text-sm text-slate-600">{store.name}の近くにいる場合、待ち時間目安を選んで記録できます。</p>
      <div className="mt-4">
        <WaitTimeSelector value={waitTime} onChange={setWaitTime} />
      </div>
      <Button className="mt-4 w-full sm:w-auto" onClick={() => setSaved(true)}>
        {saved ? <CheckCircle2 className="size-4" aria-hidden="true" /> : <Navigation className="size-4" aria-hidden="true" />}
        {saved ? "記録済み" : "来店記録を保存"}
      </Button>
    </div>
  );
}
