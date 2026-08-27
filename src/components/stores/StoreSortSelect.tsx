"use client";

import { useRouter, useSearchParams } from "next/navigation";

export type StoreSortOrder = "wait_asc" | "wait_desc";

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
    <label className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs font-black text-slate-500 shadow-sm">
      並び順
      <select
        value={value}
        onChange={(event) => updateSort(event.target.value as StoreSortOrder)}
        className="bg-transparent text-sm font-black text-slate-950 outline-none"
      >
        <option value="wait_asc">待ち時間が少ない順</option>
        <option value="wait_desc">待ち時間が多い順</option>
      </select>
    </label>
  );
}
