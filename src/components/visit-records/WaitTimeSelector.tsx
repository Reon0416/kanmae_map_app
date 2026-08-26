"use client";

import { WAIT_TIME_LABELS } from "@/constants/wait-time-options";
import type { WaitTimeBucket } from "@/features/stores/store-types";
import { cn } from "@/lib/utils";

const options = Object.entries(WAIT_TIME_LABELS) as [WaitTimeBucket, string][];

export function WaitTimeSelector({
  value,
  onChange
}: {
  value: WaitTimeBucket;
  onChange: (value: WaitTimeBucket) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {options.map(([option, label]) => (
        <button
          key={option}
          type="button"
          className={cn(
            "min-h-14 rounded-2xl bg-slate-100 px-3 text-sm font-black text-slate-700 transition active:scale-[0.98] hover:bg-slate-200",
            value === option && "bg-slate-950 text-white shadow-[0_12px_28px_rgba(15,23,42,0.25)] hover:bg-slate-950"
          )}
          onClick={() => onChange(option)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
