"use client";

import { useActionState, useEffect, useState } from "react";
import { updateWaitTimeFormAction } from "@/app/admin/actions";
import { WAIT_TIME_BUCKET, WAIT_TIME_LABELS } from "@/constants/wait-time-options";
import type { Store, WaitTimeBucket } from "@/features/stores/store-types";
import { WaitTimeSubmitButton } from "@/components/admin/WaitTimeSubmitButton";

const waitTimeOptions = Object.values(WAIT_TIME_BUCKET);

const initialState: {
  ok: boolean;
  storeId?: string;
  waitTime?: string;
  savedAt?: string;
  error?: string;
} = {
  ok: false
};

export function WaitTimeRowForm({ store }: { store: Store }) {
  const [state, formAction] = useActionState(updateWaitTimeFormAction, initialState);
  const [selectedWaitTime, setSelectedWaitTime] = useState<WaitTimeBucket>(store.waitTime);
  const saved = state.ok && state.storeId === store.id;
  const error = !state.ok && state.storeId === store.id ? state.error : undefined;

  useEffect(() => {
    if (saved && state.waitTime) {
      setSelectedWaitTime(state.waitTime as WaitTimeBucket);
    }
  }, [saved, state.waitTime]);

  return (
    <form
      action={formAction}
      className="grid gap-4 px-4 py-4 transition lg:grid-cols-[1.2fr_220px_180px_auto] lg:items-end"
    >
      <input name="storeId" type="hidden" value={store.id} />
      <div>
        <p className="text-sm font-black text-slate-950">{store.name}</p>
        <p className="mt-1 text-xs font-bold text-slate-500">
          現在: {WAIT_TIME_LABELS[selectedWaitTime]} / 最終更新:{" "}
          {new Date(saved && state.savedAt ? state.savedAt : store.lastUpdatedAt).toLocaleString("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
          })}
        </p>
        {saved ? (
          <p className="mt-2 inline-flex items-center rounded-sm bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700" aria-live="polite">
            保存しました
          </p>
        ) : null}
        {error ? (
          <p className="mt-2 inline-flex items-center rounded-sm bg-red-50 px-2 py-1 text-xs font-black text-red-700" aria-live="polite">
            保存できませんでした
          </p>
        ) : null}
      </div>

      <label className="grid gap-1.5 text-sm font-bold text-slate-700">
        待ち時間
        <select
          value={selectedWaitTime}
          name="waitTime"
          onChange={(event) => setSelectedWaitTime(event.target.value as WaitTimeBucket)}
          className="h-10 rounded-sm border border-slate-300 bg-white px-3 text-sm font-bold outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100 active:scale-[0.99]"
        >
          {waitTimeOptions.map((option) => (
            <option key={option} value={option}>
              {WAIT_TIME_LABELS[option]}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5 text-sm font-bold text-slate-700">
        表示確認
        <input
          readOnly
          value={WAIT_TIME_LABELS[selectedWaitTime]}
          className="h-10 rounded-sm border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-600 outline-none"
        />
      </label>

      <WaitTimeSubmitButton />
    </form>
  );
}
