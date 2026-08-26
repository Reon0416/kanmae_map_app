"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import type { Store } from "@/features/stores/store-types";
import { readLocalVisitRecords, type LocalVisitRecord } from "@/features/visit-records/local-visit-records";
import { cn } from "@/lib/utils";

const STAMP_GOAL = 30;

export function VisitStampCard({ stores }: { stores: Store[] }) {
  const [records, setRecords] = useState<LocalVisitRecord[]>([]);

  useEffect(() => {
    const updateRecords = () => setRecords(readLocalVisitRecords());
    updateRecords();
    window.addEventListener("storage", updateRecords);
    window.addEventListener("kanmae:visit-record-created", updateRecords);
    return () => {
      window.removeEventListener("storage", updateRecords);
      window.removeEventListener("kanmae:visit-record-created", updateRecords);
    };
  }, []);

  const stampCount = records.length;
  const currentCardStampCount = stampCount % STAMP_GOAL || (stampCount > 0 ? STAMP_GOAL : 0);
  const stampSlots = useMemo(() => Array.from({ length: STAMP_GOAL }, (_, index) => index), []);
  const stampCountsByStore = useMemo(() => {
    const counts = records.reduce<Record<string, number>>((acc, record) => {
      acc[record.storeId] = (acc[record.storeId] ?? 0) + 1;
      return acc;
    }, {});

    return stores
      .map((store) => ({
        id: store.id,
        name: store.name,
        genre: store.genre,
        count: counts[store.id] ?? 0
      }))
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return a.name.localeCompare(b.name, "ja");
      });
  }, [records, stores]);
  const maxStoreStampCount = Math.max(...stampCountsByStore.map((store) => store.count), 1);

  return (
    <section className="bg-white">
      <div className="px-3 py-5">
        <div className="relative overflow-hidden rounded-[26px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-cyan-50 to-white p-4 shadow-[0_18px_50px_rgba(15,118,110,0.14)]">
          <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-300" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-emerald-100/70" />
          <div className="absolute inset-x-4 top-1/2 h-px bg-emerald-100/70" />

          <div className="grid grid-cols-5 gap-2.5 pt-3">
            {stampSlots.map((index) => {
              const stamped = index < currentCardStampCount;
              return (
                <div
                  key={index}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-full border-2 transition",
                    stamped
                      ? "border-emerald-500 bg-white text-emerald-600 shadow-[inset_0_0_0_5px_rgba(16,185,129,0.12),0_6px_14px_rgba(16,185,129,0.18)]"
                      : "border-emerald-200 bg-white/82 shadow-inner"
                  )}
                  aria-label={stamped ? "スタンプ済み" : "未スタンプ"}
                >
                  {stamped ? (
                    <Sparkles className="size-6 opacity-90" aria-hidden="true" />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5">
          <h2 className="px-1 text-lg font-black text-slate-950">店ごとのスタンプ</h2>
          <div className="mt-3 divide-y divide-slate-100 bg-white">
            {stampCountsByStore.map((store, index) => (
              <div key={store.id} className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {index === 0 && store.count > 0 ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-black text-emerald-700">
                          TOP
                        </span>
                      ) : null}
                      <p className="truncate text-base font-black text-slate-950">{store.name}</p>
                    </div>
                    <p className="mt-0.5 text-xs font-bold text-slate-500">{store.genre}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 rounded-full bg-slate-950 px-3 py-1.5 text-sm font-black text-white">
                    <Sparkles className="size-4 text-emerald-300" aria-hidden="true" />
                    {store.count}
                  </div>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                    style={{ width: `${(store.count / maxStoreStampCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
