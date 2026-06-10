"use client";

import { Layers, LocateFixed } from "lucide-react";
import { StoreMarker } from "@/components/map/StoreMarker";
import type { Store } from "@/features/stores/store-types";

export function StoreMap({ stores, fullscreen = false }: { stores: Store[]; fullscreen?: boolean }) {
  return (
    <section className={fullscreen ? "absolute inset-0 overflow-hidden bg-[#d9eadb]" : "relative min-h-[620px] overflow-hidden rounded-lg border border-border bg-[#d9eadb] shadow-sm"}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,.75)_0_8%,transparent_8%_100%),linear-gradient(120deg,transparent_0_43%,rgba(255,255,255,.88)_43%_47%,transparent_47%),linear-gradient(25deg,transparent_0_34%,rgba(255,255,255,.8)_34%_38%,transparent_38%),linear-gradient(90deg,transparent_0_58%,rgba(255,255,255,.7)_58%_62%,transparent_62%)]" />
      <div className="absolute left-[12%] top-[18%] h-[68%] w-[10px] rotate-[18deg] rounded-full bg-white/75" />
      <div className="absolute left-[18%] top-[52%] h-[10px] w-[64%] -rotate-[7deg] rounded-full bg-white/75" />
      <div className="absolute right-[18%] top-[16%] h-[72%] w-[12px] -rotate-[29deg] rounded-full bg-white/75" />
      <div className="absolute left-[38%] top-[24%] h-32 w-28 rounded-t-full bg-slate-200/80 shadow-[inset_0_-20px_0_rgba(148,163,184,.35)]" />
      <div className="absolute left-[29%] top-[46%] h-56 w-56 rounded-full border-[14px] border-white/70 bg-emerald-200/35" />
      <div className="absolute right-[7%] top-[24%] h-[44%] w-[18%] rounded-full bg-blue-300/35 blur-[1px]" />
      <div className={fullscreen ? "sr-only" : "absolute left-5 top-5 z-10 rounded-md bg-white/95 px-3 py-2 shadow-sm"}>
        <p className="text-xs font-bold text-slate-500">KANMAE MAP</p>
        <p className="text-sm font-bold text-slate-950">関大前エリア</p>
      </div>
      <div className={fullscreen ? "absolute right-4 top-32 z-20 grid gap-2" : "absolute right-5 top-5 z-10 flex gap-2"}>
        <button className="flex size-10 items-center justify-center rounded-md bg-white text-slate-700 shadow-sm" aria-label="現在地">
          <LocateFixed className="size-5" aria-hidden="true" />
        </button>
        <button className="flex size-10 items-center justify-center rounded-md bg-white text-slate-700 shadow-sm" aria-label="表示切替">
          <Layers className="size-5" aria-hidden="true" />
        </button>
      </div>
      {stores.map((store) => (
        <StoreMarker
          key={store.id}
          store={store}
        />
      ))}
    </section>
  );
}
