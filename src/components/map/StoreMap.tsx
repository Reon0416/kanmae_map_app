"use client";

import { Layers, LocateFixed } from "lucide-react";
import Image from "next/image";
import { StoreMarker } from "@/components/map/StoreMarker";
import type { Store } from "@/features/stores/store-types";
import { KANMAE_MAP_IMAGE, latLngToMapPosition } from "@/lib/map/map-config";
import { useState } from "react";

type UserLocation = {
  position: {
    x: number;
    y: number;
  };
  accuracy: number;
};

export function StoreMap({ stores, fullscreen = false }: { stores: Store[]; fullscreen?: boolean }) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  const locateUser = () => {
    if (!navigator.geolocation) {
      setLocationMessage("このブラウザでは現在地を取得できません");
      return;
    }

    setLocationMessage("現在地を取得中");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          position: latLngToMapPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }),
          accuracy: position.coords.accuracy
        });
        setLocationMessage(null);
      },
      () => {
        setLocationMessage("現在地の許可が必要です");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000
      }
    );
  };

  return (
    <section className={fullscreen ? "absolute inset-0 overflow-hidden bg-[#d9eadb]" : "relative min-h-[620px] overflow-hidden rounded-lg border border-border bg-[#d9eadb] shadow-sm"}>
      <div className="absolute left-1/2 top-0 h-full aspect-[2/3] -translate-x-1/2">
        <Image
          src={KANMAE_MAP_IMAGE}
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 67vh"
          className="absolute inset-0 size-full select-none object-fill"
          draggable={false}
        />
        {stores.map((store) => (
          <StoreMarker
            key={store.id}
            store={store}
          />
        ))}
        {userLocation ? (
          <div
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${userLocation.position.x}%`, top: `${userLocation.position.y}%` }}
            aria-label={`現在地 精度約${Math.round(userLocation.accuracy)}メートル`}
          >
            <span className="absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/20 ring-1 ring-sky-500/30" />
            <span className="relative block size-4 rounded-full border-2 border-white bg-sky-500 shadow-panel ring-4 ring-sky-500/25" />
          </div>
        ) : null}
      </div>
      <div className={fullscreen ? "sr-only" : "absolute left-5 top-5 z-10 rounded-md bg-white/95 px-3 py-2 shadow-sm"}>
        <p className="text-xs font-bold text-slate-500">KANMAE MAP</p>
        <p className="text-sm font-bold text-slate-950">関大前エリア</p>
      </div>
      <div className={fullscreen ? "absolute right-4 top-32 z-20 grid gap-2" : "absolute right-5 top-5 z-10 flex gap-2"}>
        <button
          className="flex size-10 items-center justify-center rounded-md bg-white text-slate-700 shadow-sm"
          aria-label="現在地"
          onClick={locateUser}
          type="button"
        >
          <LocateFixed className="size-5" aria-hidden="true" />
        </button>
        <button className="flex size-10 items-center justify-center rounded-md bg-white text-slate-700 shadow-sm" aria-label="表示切替">
          <Layers className="size-5" aria-hidden="true" />
        </button>
      </div>
      {locationMessage ? (
        <div className="absolute left-4 top-4 z-20 rounded-md bg-white/92 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm">
          {locationMessage}
        </div>
      ) : null}
    </section>
  );
}
