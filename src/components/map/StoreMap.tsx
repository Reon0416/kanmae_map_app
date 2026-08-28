"use client";

import { LocateFixed } from "lucide-react";
import Image from "next/image";
import { StoreMarker } from "@/components/map/StoreMarker";
import type { Store } from "@/features/stores/store-types";
import { KANMAE_MAP_IMAGE, latLngToMapPosition } from "@/lib/map/map-config";
import { PointerEvent, WheelEvent, useCallback, useEffect, useRef, useState } from "react";

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

type MapSize = {
  width: number;
  height: number;
};

const MAP_ASPECT_RATIO = 64 / 75;
const INITIAL_SCALE = 1.25;
const INITIAL_OFFSET = { x: 0, y: 92 };
const TAP_MOVE_THRESHOLD = 8;

function getCoverMapSize(width: number, height: number): MapSize {
  if (width / height > MAP_ASPECT_RATIO) {
    return {
      width,
      height: width / MAP_ASPECT_RATIO
    };
  }

  return {
    width: height * MAP_ASPECT_RATIO,
    height
  };
}

export function StoreMap({
  stores,
  fullscreen = false,
  onMapTap,
  onStoreSelect
}: {
  stores: Store[];
  fullscreen?: boolean;
  onMapTap?: () => void;
  onStoreSelect?: (store: Store) => void;
}) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const scale = INITIAL_SCALE;
  const [offset, setOffset] = useState<MapOffset>(INITIAL_OFFSET);
  const [mapSize, setMapSize] = useState<MapSize>({ width: 0, height: 0 });
  const sectionRef = useRef<HTMLElement | null>(null);
  const dragState = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startOffset: MapOffset;
  } | null>(null);

  const clampOffset = useCallback((nextOffset: MapOffset, nextScale = scale) => {
    const container = sectionRef.current;

    if (!container) return nextOffset;

    const rect = container.getBoundingClientRect();
    const currentMapSize = mapSize.width > 0 ? mapSize : getCoverMapSize(rect.width, rect.height);
    const maxX = Math.max(0, (currentMapSize.width * nextScale - rect.width) / 2);
    const maxY = Math.max(0, (currentMapSize.height * nextScale - rect.height) / 2);

    return {
      x: Math.min(maxX, Math.max(-maxX, nextOffset.x)),
      y: Math.min(maxY, Math.max(-maxY, nextOffset.y))
    };
  }, [mapSize, scale]);

  useEffect(() => {
    const container = sectionRef.current;

    if (!container) return;

    const updateMapSize = () => {
      const rect = container.getBoundingClientRect();
      setMapSize(getCoverMapSize(rect.width, rect.height));
    };

    updateMapSize();
    const observer = new ResizeObserver(updateMapSize);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setOffset((currentOffset) => clampOffset(currentOffset));
  }, [clampOffset]);

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

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    if (event.target instanceof Element && event.target.closest("a, button")) return;

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

    setOffset(clampOffset({
      x: drag.startOffset.x + event.clientX - drag.startX,
      y: drag.startOffset.y + event.clientY - drag.startY
    }));
  };

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    const drag = dragState.current;

    if (drag?.pointerId === event.pointerId) {
      dragState.current = null;

      const movedDistance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
      if (
        movedDistance <= TAP_MOVE_THRESHOLD &&
        !(event.target instanceof Element && event.target.closest("a, button"))
      ) {
        onMapTap?.();
      }
    }
  };

  const handleWheel = (event: WheelEvent<HTMLElement>) => {
    event.preventDefault();
  };

  return (
    <section
      ref={sectionRef}
      className={fullscreen ? "absolute inset-0 cursor-grab touch-none overflow-hidden bg-[#d9eadb] active:cursor-grabbing" : "relative min-h-[620px] cursor-grab touch-none overflow-hidden rounded-lg border border-border bg-[#d9eadb] shadow-sm active:cursor-grabbing"}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
    >
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: mapSize.width || undefined,
          height: mapSize.height || undefined,
          transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${scale})`,
          transformOrigin: "center"
        }}
      >
        <Image
          src={KANMAE_MAP_IMAGE}
          alt=""
          fill
          priority
          unoptimized
          quality={100}
          sizes="100vw"
          className="absolute inset-0 size-full select-none object-fill"
          draggable={false}
        />
        {stores.map((store) => (
          <StoreMarker
            key={store.id}
            store={store}
            onSelect={(selectedStore) => onStoreSelect?.(selectedStore)}
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
      </div>
      {locationMessage ? (
        <div className="absolute left-4 top-4 z-20 rounded-md bg-white/92 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm">
          {locationMessage}
        </div>
      ) : null}
    </section>
  );
}
