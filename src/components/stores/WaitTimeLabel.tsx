import { Clock3 } from "lucide-react";
import { WAIT_TIME_LABELS } from "@/constants/wait-time-options";
import type { WaitTimeBucket } from "@/features/stores/store-types";

export function WaitTimeLabel({ waitTime }: { waitTime: WaitTimeBucket }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700">
      <Clock3 className="size-4" aria-hidden="true" />
      {WAIT_TIME_LABELS[waitTime]}
    </span>
  );
}
