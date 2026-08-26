"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { readLocalVisitRecords, type LocalVisitRecord } from "@/features/visit-records/local-visit-records";
import { cn } from "@/lib/utils";

const dayLabels = ["日", "月", "火", "水", "木", "金", "土"];

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthLabel(date: Date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

function getMonthDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = Array.from({ length: firstDay.getDay() }, () => null);

  for (let day = 1; day <= lastDate; day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export function VisitStampCalendar() {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
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

  const recordsByDate = useMemo(() => {
    return records.reduce<Record<string, LocalVisitRecord[]>>((acc, record) => {
      const key = dateKey(new Date(record.visitedAt));
      acc[key] = [...(acc[key] ?? []), record];
      return acc;
    }, {});
  }, [records]);

  const cells = useMemo(() => getMonthDays(visibleMonth), [visibleMonth]);
  const thisMonthCount = useMemo(() => {
    return records.filter((record) => {
      const visitedAt = new Date(record.visitedAt);
      return (
        visitedAt.getFullYear() === visibleMonth.getFullYear() &&
        visitedAt.getMonth() === visibleMonth.getMonth()
      );
    }).length;
  }, [records, visibleMonth]);

  const moveMonth = (amount: number) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };

  return (
    <section className="bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
        <div>
          <p className="text-xs font-black text-emerald-600">来店スタンプ</p>
          <h2 className="mt-0.5 text-xl font-black text-slate-950">{monthLabel(visibleMonth)}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-600"
            onClick={() => moveMonth(-1)}
            aria-label="前の月"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-600"
            onClick={() => moveMonth(1)}
            aria-label="次の月"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="px-3 pb-4 pt-3">
        <div className="mb-3 rounded-2xl bg-emerald-50 px-4 py-3">
          <p className="text-sm font-bold text-emerald-950">今月のスタンプ</p>
          <p className="mt-1 text-3xl font-black text-emerald-600">{thisMonthCount}</p>
        </div>

        <div className="grid grid-cols-7 text-center text-xs font-black text-slate-400">
          {dayLabels.map((label) => (
            <div key={label} className="py-2">{label}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((date, index) => {
            const key = date ? dateKey(date) : `empty-${index}`;
            const dayRecords = date ? recordsByDate[dateKey(date)] ?? [] : [];
            const hasStamp = dayRecords.length > 0;

            return (
              <div
                key={key}
                className={cn(
                  "relative flex aspect-square min-h-12 flex-col items-center justify-start rounded-2xl p-1.5",
                  date ? "bg-slate-50 text-slate-700" : "bg-transparent",
                  hasStamp && "bg-emerald-50 text-emerald-950 ring-1 ring-emerald-100"
                )}
              >
                {date ? <span className="text-xs font-black">{date.getDate()}</span> : null}
                {hasStamp ? (
                  <span className="mt-1 flex size-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                    <Sparkles className="size-4" aria-hidden="true" />
                  </span>
                ) : null}
                {dayRecords.length > 1 ? (
                  <span className="absolute bottom-1 right-1 rounded-full bg-slate-950 px-1.5 text-[10px] font-black text-white">
                    {dayRecords.length}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
