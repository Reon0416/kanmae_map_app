import { STATUS_LABELS } from "@/constants/crowd-status";
import type { DisplayStatus } from "@/features/stores/store-types";
import { cn } from "@/lib/utils";

const badgeStyles: Record<DisplayStatus, string> = {
  available: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  limited: "bg-yellow-100 text-yellow-900 ring-yellow-200",
  slightly_crowded: "bg-orange-100 text-orange-900 ring-orange-200",
  full: "bg-red-100 text-red-800 ring-red-200",
  stale: "bg-slate-100 text-slate-700 ring-slate-200",
  unknown: "bg-slate-100 text-slate-700 ring-slate-200"
};

export function StoreStatusBadge({ status, className }: { status: DisplayStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1",
        badgeStyles[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
