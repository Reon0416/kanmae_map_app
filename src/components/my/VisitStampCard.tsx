"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import type { Store } from "@/features/stores/store-types";
import { readLocalVisitRecords, type LocalVisitRecord } from "@/features/visit-records/local-visit-records";
import { getStampImage } from "@/features/visit-records/stamp-images";
import { cn } from "@/lib/utils";

const STAMP_GOAL = 12;

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
  const currentCardRecords = useMemo(() => records.slice(0, currentCardStampCount), [currentCardStampCount, records]);
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

  return (
    <section className="bg-white">
      <div className="px-3 py-5">
        <div className="relative overflow-hidden rounded-[26px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-cyan-50 to-white p-4 shadow-[0_18px_50px_rgba(15,118,110,0.14)]">
          <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-300" />

          <div className="relative z-10 flex items-end justify-between gap-4 border-b border-emerald-100/80 pb-4 pt-2">
            <div>
              <p className="text-xs font-black text-emerald-600">STAMP CARD</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">スタンプカード</h2>
            </div>
            <div className="flex items-end gap-1 text-right">
              <span className="text-5xl font-black leading-none tracking-normal text-emerald-600">{currentCardStampCount}</span>
              <span className="pb-1 text-2xl font-black text-slate-300">/ {STAMP_GOAL}</span>
            </div>
          </div>

          <div className="relative z-10 mt-4 grid grid-cols-4 gap-3">
            {stampSlots.map((index) => {
              const stampRecord = currentCardRecords[index];
              const stampImage = stampRecord ? getStampImage(stampRecord.storeId) : undefined;
              const stamped = Boolean(stampRecord);
              return (
                <div
                  key={index}
                  className={cn(
                    "relative flex aspect-square items-center justify-center rounded-full border-2 transition",
                    stamped
                      ? "border-emerald-500 bg-white text-emerald-600 shadow-[inset_0_0_0_5px_rgba(16,185,129,0.12),0_6px_14px_rgba(16,185,129,0.18)]"
                      : "border-dashed border-emerald-300/70 bg-white/60 text-emerald-300/70"
                  )}
                  aria-label={stamped ? "スタンプ済み" : "未スタンプ"}
                >
                  {stamped && stampImage ? (
                    <Image
                      src={stampImage}
                      alt={`${stampRecord.storeName}のスタンプ`}
                      width={72}
                      height={72}
                      className="size-full rounded-full object-contain p-0.5"
                    />
                  ) : stamped ? (
                    <Sparkles className="size-6 opacity-90" aria-hidden="true" />
                  ) : (
                    <span className="text-xl font-black leading-none">{index + 1}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5">
          <div className="overflow-hidden rounded-[26px] bg-slate-950 p-5 text-white shadow-[0_18px_44px_rgba(15,23,42,0.22)]">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black text-emerald-300">MEDAL COLLECTION</p>
                <h2 className="mt-1 text-xl font-black tracking-normal">メダル図鑑</h2>
              </div>
              <div className="text-right">
                <p className="text-5xl font-black leading-none tracking-normal text-white">{stampCount}</p>
                <p className="mt-1 text-xs font-black text-slate-300">枚</p>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {stampCountsByStore.map((store, index) => (
              <div
                key={store.id}
                className={cn(
                  "relative overflow-hidden rounded-[22px] border bg-white p-3 shadow-sm",
                  store.count > 0 ? "border-emerald-100" : "border-slate-100 opacity-45 grayscale"
                )}
              >
                {index === 0 && store.count > 0 ? (
                  <span className="absolute left-2 top-2 z-10 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-black text-white">
                    TOP
                  </span>
                ) : null}
                <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-50 to-cyan-50 shadow-inner">
                  {getStampImage(store.id) ? (
                    <Image
                      src={getStampImage(store.id) ?? ""}
                      alt={`${store.name}のスタンプ`}
                      width={92}
                      height={92}
                      className="size-[88px] rounded-full object-contain"
                    />
                  ) : (
                    <Sparkles className="size-10 text-emerald-400" aria-hidden="true" />
                  )}
                </div>

                <div className="mt-3 min-w-0 text-center">
                  <p className="truncate text-sm font-black text-slate-950">{store.name}</p>
                  <p className="mt-0.5 text-[11px] font-bold text-slate-500">{store.genre}</p>
                </div>

                <div className="mt-3 flex items-center justify-center">
                  <div className={cn(
                    "flex items-center gap-1 rounded-full px-3 py-1.5 text-lg font-black",
                    store.count > 0 ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-400"
                  )}>
                    {store.count > 0 && getStampImage(store.id) ? (
                      <Image
                        src={getStampImage(store.id) ?? ""}
                        alt={`${store.name}のスタンプ`}
                        width={22}
                        height={22}
                        className="size-6 rounded-full object-contain"
                      />
                    ) : (
                      <Sparkles className="size-5 text-emerald-300" aria-hidden="true" />
                    )}
                    <span>{store.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
