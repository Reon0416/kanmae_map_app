"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { readLocalVisitRecords, type LocalVisitRecord } from "@/features/visit-records/local-visit-records";
import { cn } from "@/lib/utils";

const STAMP_GOAL = 20;

function formatVisitDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function VisitStampCard() {
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
  const completedCards = Math.floor(stampCount / STAMP_GOAL);
  const progress = Math.min((currentCardStampCount / STAMP_GOAL) * 100, 100);
  const recentRecords = useMemo(() => records.slice(0, 3), [records]);

  return (
    <section className="bg-white">
      <div className="bg-gradient-to-br from-emerald-500 to-cyan-500 px-5 pb-6 pt-5 text-white">
        <p className="text-sm font-black opacity-80">来店スタンプ</p>
        <h2 className="mt-1 text-3xl font-black tracking-normal">スタンプカード</h2>
      </div>

      <div className="px-3 py-4">
        <div className="rounded-[28px] bg-slate-950 p-4 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black text-emerald-300">KANMAE CARD</p>
              <p className="mt-1 text-2xl font-black">{currentCardStampCount}/{STAMP_GOAL}</p>
            </div>
            <div className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-white">
              {completedCards > 0 ? `${completedCards}枚達成` : "1枚目"}
            </div>
          </div>

          <div className="mt-4 h-2 rounded-full bg-white/12">
            <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${progress}%` }} />
          </div>

          <div className="mt-5 grid grid-cols-5 gap-2">
            {Array.from({ length: STAMP_GOAL }, (_, index) => {
              const stamped = index < currentCardStampCount;
              return (
                <div
                  key={index}
                  className={cn(
                    "relative flex aspect-square items-center justify-center rounded-2xl border text-sm font-black",
                    stamped
                      ? "border-emerald-300 bg-emerald-400 text-slate-950 shadow-[0_8px_20px_rgba(52,211,153,0.28)]"
                      : "border-white/10 bg-white/8 text-white/35"
                  )}
                >
                  {stamped ? (
                    <Sparkles className="size-6" aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                  {stamped ? (
                    <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-white text-emerald-600">
                      <Check className="size-3.5" aria-hidden="true" />
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 bg-white">
          <h3 className="px-1 text-base font-black text-slate-950">最近のスタンプ</h3>
          <div className="mt-2 divide-y divide-slate-100">
            {recentRecords.length > 0 ? (
              recentRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950">{record.storeName}</p>
                    <p className="mt-0.5 text-xs font-bold text-slate-500">{formatVisitDate(record.visitedAt)}</p>
                  </div>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Sparkles className="size-5" aria-hidden="true" />
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm font-bold text-slate-500">記録するとここにスタンプがたまります</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
