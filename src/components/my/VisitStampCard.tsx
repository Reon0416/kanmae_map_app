"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Loader2, LogIn, Sparkles } from "lucide-react";
import type { Store } from "@/features/stores/store-types";
import { MAX_VISIBLE_STAMP_CARDS, STAMPS_PER_CARD } from "@/features/visit-records/stamp-card-config";
import type { StampResponse } from "@/features/visit-records/stamp-queries";
import { getStampImage } from "@/features/visit-records/stamp-images";
import { cn } from "@/lib/utils";

function StampCardView({
  cardNumber,
  stampsByOrdinal
}: {
  cardNumber: number;
  stampsByOrdinal: Map<number, StampResponse["cardStamps"][number]>;
}) {
  const stampSlots = Array.from({ length: STAMPS_PER_CARD }, (_, index) => index);
  const pageStyle = {
    "--stamp-page-turn": 0,
    "--stamp-page-fold": 1
  } as CSSProperties;

  return (
    <div className="px-3 [perspective:1200px]">
      <div
        className="kanmae-stamp-page relative overflow-hidden rounded-[26px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-cyan-50 to-white p-4 shadow-[0_18px_50px_rgba(15,118,110,0.14)]"
        style={pageStyle}
      >
        <div className="relative z-10 flex items-center justify-between gap-4 border-b border-emerald-100/80 pb-4">
          <div>
            <p className="text-xs font-black text-emerald-600">STAMP CARD</p>
            <h2 className="mt-1 text-lg font-black text-slate-950">スタンプカード</h2>
          </div>
          <div className="rounded-full bg-white px-3 py-1.5 text-sm font-black text-emerald-700 shadow-sm">
            {cardNumber}枚目
          </div>
        </div>

        <div className="relative z-10 mt-4 grid grid-cols-4 gap-3">
          {stampSlots.map((index) => {
            const stampOrdinal = (cardNumber - 1) * STAMPS_PER_CARD + index + 1;
            const stamp = stampsByOrdinal.get(stampOrdinal);
            const stamped = Boolean(stamp);
            const stampImage = stamp ? getStampImage(stamp.storeId) : undefined;

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
                {stamp && stampImage ? (
                  <Image
                    src={stampImage}
                    alt={`${stamp.storeName}のスタンプ`}
                    width={72}
                    height={72}
                    className="size-full rounded-full object-contain p-0.5"
                  />
                ) : stamped ? (
                  <Sparkles className="size-8 opacity-90" aria-hidden="true" />
                ) : (
                  <span className="text-xl font-black leading-none">{index + 1}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function VisitStampCard({ stores, initialStampData }: { stores: Store[]; initialStampData: StampResponse | null }) {
  const [stampData, setStampData] = useState<StampResponse | null>(initialStampData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialStampData ? null : "スタンプを見るにはログインしてください。");

  useEffect(() => {
    let ignore = false;

    async function loadStamps() {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/stamps", {
        cache: "no-store"
      });

      if (ignore) {
        return;
      }

      if (response.status === 401) {
        setStampData(null);
        setError("スタンプを見るにはログインしてください。");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        setStampData(null);
        setError("スタンプを読み込めませんでした。");
        setIsLoading(false);
        return;
      }

      setStampData(await response.json());
      setIsLoading(false);
    }

    window.addEventListener("kanmae:visit-record-created", loadStamps);

    return () => {
      ignore = true;
      window.removeEventListener("kanmae:visit-record-created", loadStamps);
    };
  }, []);

  const stampCountsByStore = useMemo(() => {
    const counts = new Map((stampData?.stores ?? []).map((item) => [item.storeId, item]));

    return stores
      .map((store) => {
        const count = counts.get(store.id);
        return {
          id: store.id,
          name: store.name,
          genre: store.genre,
          count: count?.stampCount ?? 0
        };
      })
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return a.name.localeCompare(b.name, "ja");
      });
  }, [stampData, stores]);

  const visibleCardNumbers = useMemo(() => {
    const totalStampCount = stampData?.totalStampCount ?? 0;
    const totalCardCount = Math.max(1, Math.ceil(totalStampCount / STAMPS_PER_CARD));
    const firstVisibleCard = Math.max(1, totalCardCount - MAX_VISIBLE_STAMP_CARDS + 1);

    return Array.from(
      { length: totalCardCount - firstVisibleCard + 1 },
      (_, index) => firstVisibleCard + index
    );
  }, [stampData]);

  const stampsByOrdinal = useMemo(() => {
    return new Map((stampData?.cardStamps ?? []).map((stamp) => [stamp.stampOrdinal, stamp]));
  }, [stampData]);

  if (isLoading) {
    return (
      <section className="flex min-h-72 items-center justify-center bg-white">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          読み込み中
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white p-5">
        <div className="rounded-lg border border-border bg-slate-50 p-5">
          <h2 className="text-lg font-black text-slate-950">{error}</h2>
          <Link
            href="/login"
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-bold text-white"
          >
            <LogIn className="size-4" aria-hidden="true" />
            ログインへ
          </Link>
        </div>
      </section>
    );
  }

  const stampCount = stampData?.totalStampCount ?? 0;

  return (
    <section className="bg-white">
      <div className="py-5">
        <div className="overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex snap-x snap-mandatory scroll-smooth">
            {visibleCardNumbers.map((cardNumber) => (
              <div key={cardNumber} className="min-w-full snap-start">
                <StampCardView cardNumber={cardNumber} stampsByOrdinal={stampsByOrdinal} />
              </div>
            ))}
          </div>
        </div>
        {visibleCardNumbers.length > 1 ? (
          <div className="mt-1 flex justify-center gap-1.5" aria-hidden="true">
            {visibleCardNumbers.map((cardNumber) => (
              <span key={cardNumber} className="block h-1.5 w-1.5 rounded-full bg-slate-200" />
            ))}
          </div>
        ) : null}

        <div className="mt-5 px-3">
          <div className="overflow-hidden rounded-[26px] bg-slate-950 p-5 text-white shadow-[0_18px_44px_rgba(15,23,42,0.22)]">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black text-emerald-300">STAMP COLLECTION</p>
                <h2 className="mt-1 text-xl font-black tracking-normal">集めたスタンプ</h2>
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
