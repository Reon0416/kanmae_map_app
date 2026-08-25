"use client";

import { LocateFixed, Minus, Plus, RotateCcw } from "lucide-react";
import Image from "next/image";
import { StoreMarker } from "@/components/map/StoreMarker";
import type { Store } from "@/features/stores/store-types";
import { KANMAE_MAP_IMAGE, latLngToMapPosition } from "@/lib/map/map-config";
import { PointerEvent, WheelEvent, useRef, useState } from "react";

type UserLocation = {
  position: {
    x: number;
    y: number;
  };
  accuracy: number;
};

type MapOffset = {
  x: number;
  y: number;
};

const MIN_SCALE = 1;
const MAX_SCALE = 2.6;
const SCALE_STEP = 0.2;

function clampScale(scale: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number(scale.toFixed(2))));
}

export function StoreMap({ stores, fullscreen = false }: { stores: Store[]; fullscreen?: boolean }) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [scale, setScale] = useState(1.25);
  const [offset, setOffset] = useState<MapOffset>({ x: 0, y: 92 });
  const dragState = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startOffset: MapOffset;
  } | null>(null);

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

  const zoomBy = (delta: number) => {
    setScale((currentScale) => clampScale(currentScale + delta));
  };

  const resetView = () => {
    setScale(1.25);
    setOffset({ x: 0, y: 92 });
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffset: offset
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const drag = dragState.current;

    if (!drag || drag.pointerId !== event.pointerId) return;

    setOffset({
      x: drag.startOffset.x + event.clientX - drag.startX,
      y: drag.startOffset.y + event.clientY - drag.startY
    });
  };

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    if (dragState.current?.pointerId === event.pointerId) {
      dragState.current = null;
    }
  };

  const handleWheel = (event: WheelEvent<HTMLElement>) => {
    event.preventDefault();
    zoomBy(event.deltaY > 0 ? -SCALE_STEP : SCALE_STEP);
  };

  return (
    <section
      className={fullscreen ? "absolute inset-0 cursor-grab touch-none overflow-hidden bg-[#d9eadb] active:cursor-grabbing" : "relative min-h-[620px] cursor-grab touch-none overflow-hidden rounded-lg border border-border bg-[#d9eadb] shadow-sm active:cursor-grabbing"}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
    >
      <div
        className="absolute left-1/2 top-1/2 h-full aspect-[64/75]"
        style={{
          transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${scale})`,
          transformOrigin: "center"
        }}
      >
        <Image
          src={KANMAE_MAP_IMAGE}
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 86vh"
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
          aria-label="拡大"
          onClick={() => zoomBy(SCALE_STEP)}
          type="button"
        >
          <Plus className="size-5" aria-hidden="true" />
        </button>
        <button
          className="flex size-10 items-center justify-center rounded-md bg-white text-slate-700 shadow-sm"
          aria-label="縮小"
          onClick={() => zoomBy(-SCALE_STEP)}
          type="button"
        >
          <Minus className="size-5" aria-hidden="true" />
        </button>
        <button
          className="flex size-10 items-center justify-center rounded-md bg-white text-slate-700 shadow-sm"
          aria-label="現在地"
          onClick={locateUser}
          type="button"
        >
          <LocateFixed className="size-5" aria-hidden="true" />
        </button>
        <button
          className="flex size-10 items-center justify-center rounded-md bg-white text-slate-700 shadow-sm"
          aria-label="表示をリセット"
          onClick={resetView}
          type="button"
        >
          <RotateCcw className="size-5" aria-hidden="true" />
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
