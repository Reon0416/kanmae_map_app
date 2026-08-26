"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { readLocalVisitRecords, type LocalVisitRecord } from "@/features/visit-records/local-visit-records";
import { cn } from "@/lib/utils";

const STAMP_GOAL = 30;

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
  const stampSlots = useMemo(() => Array.from({ length: STAMP_GOAL }, (_, index) => index), []);

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
      </div>
    </section>
  );
}
