"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { STATUS_LABELS } from "@/constants/crowd-status";
import { WAIT_TIME_LABELS } from "@/constants/wait-time-options";
import type { DisplayStatus, Store, WaitTimeBucket } from "@/features/stores/store-types";
import { cn } from "@/lib/utils";

const waitTimeOptions: { value: WaitTimeBucket; label: string }[] = [
  { value: "no_wait", label: WAIT_TIME_LABELS.no_wait },
  { value: "within_5", label: WAIT_TIME_LABELS.within_5 },
  { value: "between_5_10", label: WAIT_TIME_LABELS.between_5_10 },
  { value: "between_10_20", label: WAIT_TIME_LABELS.between_10_20 },
  { value: "over_20", label: WAIT_TIME_LABELS.over_20 }
];

const statusOptions: { value: DisplayStatus; label: string }[] = [
  { value: "available", label: STATUS_LABELS.available },
  { value: "limited", label: STATUS_LABELS.limited },
  { value: "slightly_crowded", label: STATUS_LABELS.slightly_crowded },
  { value: "full", label: STATUS_LABELS.full },
  { value: "stale", label: STATUS_LABELS.stale },
  { value: "unknown", label: STATUS_LABELS.unknown }
];

export function MapFilterForm({ stores }: { stores: Store[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [waitTime, setWaitTime] = useState<WaitTimeBucket | "all">((searchParams.get("waitTime") ?? "all") as WaitTimeBucket | "all");
  const [status, setStatus] = useState<DisplayStatus | "all">((searchParams.get("status") ?? "all") as DisplayStatus | "all");
  const [genre, setGenre] = useState(searchParams.get("genre") ?? "all");

  const genreOptions = useMemo(() => {
    return Array.from(new Set(stores.map((store) => store.genre)));
  }, [stores]);

  function applyFilters() {
    const params = new URLSearchParams();
    if (waitTime !== "all") params.set("waitTime", waitTime);
    if (status !== "all") params.set("status", status);
    if (genre !== "all") params.set("genre", genre);
    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  }

  function clearFilters() {
    setWaitTime("all");
    setStatus("all");
    setGenre("all");
  }

  return (
    <main className="min-h-dvh bg-white px-5 pb-28 pt-6">
      <header className="mb-8 grid grid-cols-[1fr_auto_1fr] items-center">
        <Link href="/" aria-label="戻る" className="flex size-10 items-center justify-center rounded-full text-slate-700">
          <ArrowLeft className="size-5" aria-hidden="true" />
        </Link>
        <h1 className="text-2xl font-black text-slate-950">フィルター</h1>
        <button type="button" className="justify-self-end text-sm font-black text-sky-500" onClick={clearFilters}>
          クリア
        </button>
      </header>

      <FilterSection title="待ち時間">
        <FilterButton active={waitTime === "all"} onClick={() => setWaitTime("all")}>全て</FilterButton>
        {waitTimeOptions.map((option) => (
          <FilterButton key={option.value} active={waitTime === option.value} onClick={() => setWaitTime(option.value)}>
            {option.label}
          </FilterButton>
        ))}
      </FilterSection>

      <FilterSection title="混雑状況">
        <FilterButton active={status === "all"} onClick={() => setStatus("all")}>全て</FilterButton>
        {statusOptions.map((option) => (
          <FilterButton key={option.value} active={status === option.value} onClick={() => setStatus(option.value)}>
            {option.label}
          </FilterButton>
        ))}
      </FilterSection>

      <FilterSection title="店舗のジャンル">
        <FilterButton active={genre === "all"} onClick={() => setGenre("all")}>全て</FilterButton>
        {genreOptions.map((option) => (
          <FilterButton key={option} active={genre === option} onClick={() => setGenre(option)}>
            {option}
          </FilterButton>
        ))}
      </FilterSection>

      <div className="fixed inset-x-5 bottom-6 z-20">
        <button
          type="button"
          className="flex h-16 w-full items-center justify-center gap-2 rounded-md bg-sky-500 text-lg font-black text-white shadow-panel"
          onClick={applyFilters}
        >
          <Check className="size-6" aria-hidden="true" />
          OK
        </button>
      </div>
    </main>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-xl font-black text-slate-950">{title}</h2>
      <div className="flex flex-wrap gap-3">{children}</div>
    </section>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      className={cn(
        "min-h-12 rounded-md border-2 px-4 py-2 text-base font-black transition",
        active
          ? "border-sky-500 bg-sky-500 text-white"
          : "border-sky-400 bg-white text-sky-500"
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
