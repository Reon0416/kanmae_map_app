"use client";

import { LocateFixed, Minus, Plus } from "lucide-react";
import Image from "next/image";
import type { Store } from "@/features/stores/store-types";
import { ACTIVE_MAP_SOURCE_SIZE, MAP_STORE_PLACEMENTS, fitMapViewport } from "@/lib/map/map-layout";
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

const INITIAL_SCALE = 1;
const INITIAL_OFFSET = { x: 0, y: 0 };
const TAP_MOVE_THRESHOLD = 8;
const ZOOM_STEP = 1.35;

type PointerPosition = { x: number; y: number };

type GestureState =
  | {
      kind: "drag";
      pointerId: number;
      start: PointerPosition;
      startOffset: MapOffset;
    }
  | {
      kind: "pinch";
      startCenter: PointerPosition;
      startDistance: number;
      startOffset: MapOffset;
      startScale: number;
    };

function getViewportMapSize(width: number, height: number): MapSize {
  return fitMapViewport(width, height);
}

export function StoreMap({
  stores,
  fullscreen = false,
  onMapTap
}: {
  stores: Store[];
  fullscreen?: boolean;
  onMapTap?: () => void;
  onStoreSelect?: (store: Store) => void;
}) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [scale, setScale] = useState(INITIAL_SCALE);
  const [offset, setOffset] = useState<MapOffset>(INITIAL_OFFSET);
  const [mapSize, setMapSize] = useState<MapSize>({ width: 0, height: 0 });
  const sectionRef = useRef<HTMLElement | null>(null);
  const pointers = useRef(new Map<number, PointerPosition>());
  const gesture = useRef<GestureState | null>(null);

  const maxScale = mapSize.width > 0 && mapSize.height > 0
    ? Math.max(INITIAL_SCALE, Math.min(5,
        ACTIVE_MAP_SOURCE_SIZE.width / mapSize.width,
        ACTIVE_MAP_SOURCE_SIZE.height / mapSize.height))
    : INITIAL_SCALE;

  const clampOffset = useCallback((nextOffset: MapOffset, nextScale = scale) => {
    const container = sectionRef.current;

    if (!container) return nextOffset;

    const rect = container.getBoundingClientRect();
    const currentMapSize = mapSize.width > 0 ? mapSize : getViewportMapSize(rect.width, rect.height);
    const maxX = Math.max(0, (currentMapSize.width * nextScale - rect.width) / 2);
    const maxY = Math.max(0, (currentMapSize.height * nextScale - rect.height) / 2);

    return {
      x: Math.min(maxX, Math.max(-maxX, nextOffset.x)),
      y: Math.min(maxY, Math.max(-maxY, nextOffset.y))
    };
  }, [mapSize, scale]);

  const zoomAt = useCallback((requestedScale: number, focus: PointerPosition) => {
    const nextScale = Math.min(maxScale, Math.max(INITIAL_SCALE, requestedScale));
    if (nextScale === scale) return;

    const nextOffset = {
      x: focus.x - ((focus.x - offset.x) / scale) * nextScale,
      y: focus.y - ((focus.y - offset.y) / scale) * nextScale
    };

    setScale(nextScale);
    setOffset(clampOffset(nextOffset, nextScale));
  }, [clampOffset, maxScale, offset, scale]);

  useEffect(() => {
    const container = sectionRef.current;

    if (!container) return;

    const updateMapSize = () => {
      const rect = container.getBoundingClientRect();
      setMapSize(getViewportMapSize(rect.width, rect.height));
    };

    updateMapSize();
    const observer = new ResizeObserver(updateMapSize);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setOffset((currentOffset) => clampOffset(currentOffset));
  }, [clampOffset]);

  useEffect(() => {
    if (scale <= maxScale) return;
    setScale(maxScale);
    setOffset((currentOffset) => clampOffset(currentOffset, maxScale));
  }, [clampOffset, maxScale, scale]);

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
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    const activePointers = [...pointers.current.entries()];
    if (activePointers.length === 1) {
      gesture.current = {
        kind: "drag",
        pointerId: event.pointerId,
        start: { x: event.clientX, y: event.clientY },
        startOffset: offset
      };
      return;
    }

    const [, first] = activePointers[0];
    const [, second] = activePointers[1];
    gesture.current = {
      kind: "pinch",
      startCenter: { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 },
      startDistance: Math.hypot(second.x - first.x, second.y - first.y),
      startOffset: offset,
      startScale: scale
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    const activePointers = [...pointers.current.values()];
    const currentGesture = gesture.current;
    if (activePointers.length >= 2 && currentGesture?.kind === "pinch") {
      const [first, second] = activePointers;
      const distance = Math.hypot(second.x - first.x, second.y - first.y);
      const center = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
      const nextScale = Math.min(maxScale, Math.max(INITIAL_SCALE,
        currentGesture.startScale * distance / Math.max(1, currentGesture.startDistance)));
      const container = sectionRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const startFocus = {
        x: currentGesture.startCenter.x - rect.left - rect.width / 2,
        y: currentGesture.startCenter.y - rect.top - rect.height / 2
      };
      const currentFocus = {
        x: center.x - rect.left - rect.width / 2,
        y: center.y - rect.top - rect.height / 2
      };
      const nextOffset = {
        x: currentFocus.x - ((startFocus.x - currentGesture.startOffset.x) / currentGesture.startScale) * nextScale,
        y: currentFocus.y - ((startFocus.y - currentGesture.startOffset.y) / currentGesture.startScale) * nextScale
      };
      setScale(nextScale);
      setOffset(clampOffset(nextOffset, nextScale));
      return;
    }

    if (currentGesture?.kind === "drag" && currentGesture.pointerId === event.pointerId) {
      setOffset(clampOffset({
        x: currentGesture.startOffset.x + event.clientX - currentGesture.start.x,
        y: currentGesture.startOffset.y + event.clientY - currentGesture.start.y
      }));
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    const currentGesture = gesture.current;
    pointers.current.delete(event.pointerId);

    if (currentGesture?.kind === "drag" && currentGesture.pointerId === event.pointerId) {
      const movedDistance = Math.hypot(event.clientX - currentGesture.start.x, event.clientY - currentGesture.start.y);
      if (
        movedDistance <= TAP_MOVE_THRESHOLD &&
        !(event.target instanceof Element && event.target.closest("a, button"))
      ) {
        onMapTap?.();
      }
    }

    const remainingPointer = [...pointers.current.entries()][0];
    gesture.current = remainingPointer ? {
      kind: "drag",
      pointerId: remainingPointer[0],
      start: remainingPointer[1],
      startOffset: offset
    } : null;
  };

  const handleWheel = (event: WheelEvent<HTMLElement>) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    zoomAt(scale * Math.exp(-event.deltaY * 0.0015), {
      x: event.clientX - rect.left - rect.width / 2,
      y: event.clientY - rect.top - rect.height / 2
    });
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
        className="absolute left-1/2 top-1/2 overflow-hidden"
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
        {MAP_STORE_PLACEMENTS.filter((placement) =>
          stores.some((store) => (store.assetKey ?? store.id) === placement.storeId)
        ).map((placement) => (
          <div
            key={placement.storeId}
            className="pointer-events-none absolute"
            style={{ left: `${placement.x}%`, top: `${placement.y}%`, width: `${placement.width}%`, height: `${placement.height}%`, zIndex: placement.zIndex }}
          >
            <Image
              src={placement.image}
              alt={stores.find((store) => (store.assetKey ?? store.id) === placement.storeId)?.name ?? ""}
              fill
              unoptimized
              sizes="100vw"
              className="select-none object-contain object-bottom"
              draggable={false}
            />
          </div>
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
          className="flex size-10 items-center justify-center rounded-md bg-white text-slate-700 shadow-sm disabled:text-slate-300"
          aria-label="拡大"
          onClick={() => zoomAt(scale * ZOOM_STEP, { x: 0, y: 0 })}
          disabled={scale >= maxScale - 0.01}
          type="button"
        >
          <Plus className="size-5" aria-hidden="true" />
        </button>
        <button
          className="flex size-10 items-center justify-center rounded-md bg-white text-slate-700 shadow-sm disabled:text-slate-300"
          aria-label="縮小"
          onClick={() => zoomAt(scale / ZOOM_STEP, { x: 0, y: 0 })}
          disabled={scale <= INITIAL_SCALE + 0.01}
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
      </div>
      {locationMessage ? (
        <div className="absolute left-4 top-4 z-20 rounded-md bg-white/92 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm">
          {locationMessage}
        </div>
      ) : null}
    </section>
  );
}
