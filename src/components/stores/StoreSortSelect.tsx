"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";
import { cn } from "@/lib/utils";

export type StoreSortOrder = "wait_asc" | "wait_desc";

const sortOptions: Array<{
  value: StoreSortOrder;
  label: string;
  Icon: typeof ArrowUpNarrowWide;
}> = [
  {
    value: "wait_asc",
    label: "待ち時間が少ない順",
    Icon: ArrowUpNarrowWide
  },
  {
    value: "wait_desc",
    label: "待ち時間が多い順",
    Icon: ArrowDownWideNarrow
  }
];

export function StoreSortSelect({ value }: { value: StoreSortOrder }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateSort = (nextValue: StoreSortOrder) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextValue === "wait_asc") {
      params.delete("sort");
    } else {
      params.set("sort", nextValue);
    }

    const query = params.toString();
    router.replace(query ? `/stores?${query}` : "/stores");
  };

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/85 p-1 shadow-sm shadow-slate-200/80 backdrop-blur"
      aria-label="店舗一覧の並び順"
    >
      <span className="pl-2 pr-1 text-[11px] font-black text-slate-400">並び順</span>
      {sortOptions.map(({ value: optionValue, label, Icon }) => {
        const isActive = value === optionValue;
        return (
          <button
            key={optionValue}
            type="button"
            onClick={() => updateSort(optionValue)}
            aria-pressed={isActive}
            aria-label={label}
            title={label}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-full transition",
              isActive
                ? "bg-slate-950 text-white shadow-md shadow-slate-900/15"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
