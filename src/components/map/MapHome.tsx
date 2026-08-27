"use client";

import { useSearchParams } from "next/navigation";
import { StoreMap } from "@/components/map/StoreMap";
import type { DisplayStatus, Store, WaitTimeBucket } from "@/features/stores/store-types";
import { useMemo } from "react";

export function MapHome({ stores }: { stores: Store[] }) {
  const searchParams = useSearchParams();
  const waitTime = (searchParams.get("waitTime") ?? "all") as WaitTimeBucket | "all";
  const status = (searchParams.get("status") ?? "all") as DisplayStatus | "all";
  const genre = searchParams.get("genre") ?? "all";

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const matchesWaitTime = waitTime === "all" || store.waitTime === waitTime;
      const matchesStatus = status === "all" || store.status === status;
      const matchesGenre = genre === "all" || store.genre === genre;
      return matchesWaitTime && matchesStatus && matchesGenre;
    });
  }, [genre, status, stores, waitTime]);

  return (
    <main className="relative h-dvh overflow-hidden bg-slate-900">
      <div className="absolute inset-x-0 top-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] overflow-hidden">
        <StoreMap stores={filteredStores} fullscreen />
      </div>

      {filteredStores.length === 0 ? (
        <div className="absolute left-1/2 top-[45%] z-20 w-[min(20rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white/86 p-4 text-center shadow-panel backdrop-blur-md">
          <p className="text-base font-black text-slate-950">該当する店舗がありません</p>
          <p className="mt-1 text-sm text-slate-600">条件を変えて探してください。</p>
        </div>
      ) : null}

    </main>
  );
}
