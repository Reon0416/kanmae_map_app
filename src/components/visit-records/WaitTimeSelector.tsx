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
    <div className="grid gap-2 sm:grid-cols-5">
      {options.map(([option, label]) => (
        <button
          key={option}
          type="button"
          className={cn(
            "h-11 rounded-md border border-border bg-white px-3 text-sm font-semibold transition hover:bg-muted",
            value === option && "border-slate-950 bg-slate-950 text-white hover:bg-slate-950"
          )}
          onClick={() => onChange(option)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
