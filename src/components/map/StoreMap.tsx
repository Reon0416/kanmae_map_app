"use client";

import { LocateFixed, X } from "lucide-react";
import Image from "next/image";
import { WAIT_TIME_BUCKET, WAIT_TIME_LABELS } from "@/constants/wait-time-options";
import type { Store } from "@/features/stores/store-types";
import { ACTIVE_MAP_LAYOUT, ACTIVE_MAP_SOURCE_SIZE, ACTIVE_MAP_TILES, MAP_STORE_PLACEMENTS } from "@/lib/map/map-layout";
import { KANMAE_MAP_IMAGE, latLngToMapPosition } from "@/lib/map/map-config";
import { PointerEvent, WheelEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

type UserLocation = {
  position: {
    x: number;
    y: number;
  };
  accuracy: number;
};

type LocationError = {
  title: string;
  body: string;
  steps: string[];
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
const LANDMARK_PLACEMENT_IDS = new Set(["kandai"]);

const LOCATION_PERMISSION_ERROR: LocationError = {
  title: "現在地を取得できませんでした",
  body: "お使いのブラウザの位置情報許可をオンにすると、マップ上に現在地を表示できます。",
  steps: [
    "設定で「プライバシーとセキュリティ」を開いてください。",
    "「位置情報サービス」の中からお使いのブラウザを選び、位置情報をオンにしてください。"
  ]
};

function getMapWaitTimeValue(waitTime: Store["waitTime"]) {
  if (waitTime === WAIT_TIME_BUCKET.NO_WAIT) return "0";
  if (waitTime === WAIT_TIME_BUCKET.WITHIN_5) return "5";
  if (waitTime === WAIT_TIME_BUCKET.OVER_20) return "20+";

  return WAIT_TIME_LABELS[waitTime].replace("分", "");
}

function getMapWaitTimeValueTone(waitTime: Store["waitTime"]) {
  if (waitTime === WAIT_TIME_BUCKET.NO_WAIT || waitTime === WAIT_TIME_BUCKET.WITHIN_5) {
    return "text-emerald-600";
  }

  if (waitTime === WAIT_TIME_BUCKET.BETWEEN_5_10) {
    return "text-cyan-700";
  }

  if (waitTime === WAIT_TIME_BUCKET.BETWEEN_10_20) {
    return "text-orange-600";
  }

  return "text-[#0b3b60]";
}

function formatLockCountdown(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function getOwnerLockRemainingMs(store: Store, nowMs: number) {
  if (!store.ownerWaitTimeLockUntil) return 0;
  const lockUntil = new Date(store.ownerWaitTimeLockUntil).getTime();
  if (Number.isNaN(lockUntil)) return 0;
  return Math.max(0, lockUntil - nowMs);
}

function StoreWaitTimeMarker({ store, lockRemainingMs }: { store: Store; lockRemainingMs: number }) {
  const isOwnerLocked = lockRemainingMs > 0;

  return (
    <span
      className={`pointer-events-none absolute z-0 flex min-w-[3.8rem] flex-col items-center justify-center border px-2 pb-1.5 pt-1 text-center shadow-[0_8px_18px_rgba(15,23,42,0.14),inset_0_0_0_1px_rgba(15,23,42,0.035)] ${
        isOwnerLocked ? "rounded-[10px] border-amber-300 bg-amber-50/96 shadow-[0_10px_22px_rgba(217,119,6,0.24)]" : "rounded-[16px] border-white/90 bg-white/88"
      }`}
      aria-hidden="true"
    >
      <span
        className={`absolute bottom-[-0.46rem] left-1/2 size-4 -translate-x-1/2 rotate-45 border-b border-r shadow-[5px_5px_10px_rgba(15,23,42,0.06)] ${
          isOwnerLocked ? "border-amber-300 bg-amber-50/96" : "border-white/90 bg-white/88"
        }`}
      />
      {isOwnerLocked ? (
        <>
          <span className="relative z-10 whitespace-nowrap text-[0.55rem] font-black leading-none tracking-normal text-amber-700">今なら空席</span>
          <span className="relative z-10 mt-1 whitespace-nowrap text-[1.08rem] font-black leading-none tracking-normal text-red-600">
            {formatLockCountdown(lockRemainingMs)}
          </span>
        </>
      ) : (
        <>
          <span className={`relative z-10 whitespace-nowrap text-[1.35rem] font-black leading-none tracking-normal ${getMapWaitTimeValueTone(store.waitTime)}`}>
            {getMapWaitTimeValue(store.waitTime)}
          </span>
          <span className="relative z-10 mt-0.5 text-[0.5rem] font-black leading-none tracking-normal text-slate-500">分待ち</span>
        </>
      )}
    </span>
  );
}

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
  if (ACTIVE_MAP_LAYOUT.mode === "baked") return { width, height };

  const scale = Math.max(width / ACTIVE_MAP_LAYOUT.width, height / ACTIVE_MAP_LAYOUT.height);
  return {
    width: ACTIVE_MAP_LAYOUT.width * scale,
    height: ACTIVE_MAP_LAYOUT.height * scale
  };
}

function getTileLevel(scale: number, mapSize: MapSize) {
  if (!ACTIVE_MAP_TILES) return null;

  const displayWidth = Math.max(mapSize.width, mapSize.height) * scale;
  const desiredPixels = displayWidth * (typeof window === "undefined" ? 1 : window.devicePixelRatio || 1);
  const levels = [...ACTIVE_MAP_TILES.levels].sort((a, b) => Math.max(a.width, a.height) - Math.max(b.width, b.height));

  return levels.find((level) => Math.max(level.width, level.height) >= desiredPixels) ?? levels[levels.length - 1];
}

const TiledMapBackground = memo(function TiledMapBackground({ scale, mapSize }: { scale: number; mapSize: MapSize }) {
  const level = getTileLevel(scale, mapSize);

  if (!ACTIVE_MAP_TILES || !level) {
    return (
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
    );
  }

  const columns = Math.ceil(level.width / ACTIVE_MAP_TILES.tileSize);
  const rows = Math.ceil(level.height / ACTIVE_MAP_TILES.tileSize);
  const tiles = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      const tileWidth = Math.min(ACTIVE_MAP_TILES.tileSize, level.width - x * ACTIVE_MAP_TILES.tileSize);
      const tileHeight = Math.min(ACTIVE_MAP_TILES.tileSize, level.height - y * ACTIVE_MAP_TILES.tileSize);

      tiles.push({
        key: `${level.z}-${x}-${y}`,
        src: `${ACTIVE_MAP_TILES.basePath}/z${level.z}/${x}-${y}.webp`,
        left: x * ACTIVE_MAP_TILES.tileSize / level.width * 100,
        top: y * ACTIVE_MAP_TILES.tileSize / level.height * 100,
        width: tileWidth / level.width * 100,
        height: tileHeight / level.height * 100
      });
    }
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#d9eee8]" aria-hidden="true">
      {tiles.map((tile) => (
        <div
          key={tile.key}
          className="absolute"
          style={{
            left: `${tile.left}%`,
            top: `${tile.top}%`,
            width: `${tile.width}%`,
            height: `${tile.height}%`
          }}
        >
          <Image
            src={tile.src}
            alt=""
            fill
            unoptimized
            sizes="100vw"
            className="select-none object-fill"
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
});

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
  const [locationError, setLocationError] = useState<LocationError | null>(null);
  const [scale, setScale] = useState(INITIAL_SCALE);
  const [offset, setOffset] = useState<MapOffset>(INITIAL_OFFSET);
  const [mapSize, setMapSize] = useState<MapSize>({ width: 0, height: 0 });
  const [nowMs, setNowMs] = useState(() => Date.now());
  const sectionRef = useRef<HTMLElement | null>(null);
  const pointers = useRef(new Map<number, PointerPosition>());
  const gesture = useRef<GestureState | null>(null);
  const suppressNextStoreClick = useRef(false);
  const autoLocationRequested = useRef(false);

  const visiblePlacements = useMemo(() => {
    return MAP_STORE_PLACEMENTS
      .map((placement) => ({
        placement,
        store: stores.find((store) => (store.assetKey ?? store.id) === placement.storeId)
      }))
      .filter(({ placement, store }) => store || LANDMARK_PLACEMENT_IDS.has(placement.storeId));
  }, [stores]);

  const maxScale = mapSize.width > 0 && mapSize.height > 0
    ? Math.max(INITIAL_SCALE, Math.min(10,
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

  useEffect(() => {
    const hasActiveLock = stores.some((store) => getOwnerLockRemainingMs(store, nowMs) > 0);
    if (!hasActiveLock) return;
    const intervalId = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, [nowMs, stores]);

  const locateUser = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationMessage(null);
      setLocationError({
        ...LOCATION_PERMISSION_ERROR,
        steps: ["位置情報に対応したChromeまたはSafariで開いてください。", ...LOCATION_PERMISSION_ERROR.steps]
      });
      return;
    }

    setLocationError(null);
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
        setUserLocation(null);
        setLocationMessage(null);
        setLocationError(LOCATION_PERMISSION_ERROR);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000
      }
    );
  }, []);

  useEffect(() => {
    if (autoLocationRequested.current) return;
    autoLocationRequested.current = true;
    locateUser();
  }, [locateUser]);

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    if (event.target instanceof Element && event.target.closest("[data-map-control]")) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    suppressNextStoreClick.current = false;

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
      suppressNextStoreClick.current = movedDistance > TAP_MOVE_THRESHOLD;
      if (
        movedDistance <= TAP_MOVE_THRESHOLD &&
        !(event.target instanceof Element && event.target.closest("[data-map-control]"))
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
      data-map-surface
      className={fullscreen ? "absolute inset-0 cursor-grab touch-none overflow-hidden bg-[#d9eadb] active:cursor-grabbing" : "relative min-h-[620px] cursor-grab touch-none overflow-hidden rounded-lg border border-border bg-[#d9eadb] shadow-sm active:cursor-grabbing"}
      onDragStart={(event) => event.preventDefault()}
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
        <TiledMapBackground scale={scale} mapSize={mapSize} />
        {visiblePlacements.map(({ placement, store }) => {
          if (!store) return null;
          const lockRemainingMs = getOwnerLockRemainingMs(store, nowMs);

          return (
            <div
              key={`${placement.storeId}-wait`}
              className="pointer-events-none absolute"
              style={{
                left: `${placement.waitBubble?.x ?? placement.x + placement.width / 2}%`,
                top: `${placement.waitBubble?.y ?? placement.y}%`,
                transform: "translate(-50%, -50%)",
                zIndex: placement.zIndex + 30
              }}
            >
              <StoreWaitTimeMarker store={store} lockRemainingMs={lockRemainingMs} />
            </div>
          );
        })}
        {visiblePlacements.map(({ placement, store }) => (
          <div
            key={placement.storeId}
            className="absolute"
            style={{ left: `${placement.x}%`, top: `${placement.y}%`, width: `${placement.width}%`, height: `${placement.height}%`, zIndex: placement.zIndex + 10 }}
          >
            {store ? (
              <>
                {getOwnerLockRemainingMs(store, nowMs) > 0 ? (
                  <span
                    className="pointer-events-none absolute inset-x-[3%] bottom-[-7%] top-[6%] rounded-[24%] bg-amber-300/55 blur-md animate-pulse"
                    aria-hidden="true"
                  />
                ) : null}
                <button
                  type="button"
                  className="relative block size-full transition duration-150 hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900"
                  aria-label={`${store.name}の詳細を開く`}
                  onClick={(event) => {
                    if (suppressNextStoreClick.current) {
                      suppressNextStoreClick.current = false;
                      event.preventDefault();
                      return;
                    }

                    onStoreSelect?.(store);
                  }}
                >
                  <Image
                    src={placement.image}
                    alt=""
                    fill
                    unoptimized
                    sizes="100vw"
                    className={`z-10 select-none object-contain object-bottom ${
                      getOwnerLockRemainingMs(store, nowMs) > 0
                        ? "drop-shadow-[0_0_18px_rgba(245,158,11,0.86)]"
                        : "drop-shadow-[0_18px_18px_rgba(52,73,65,0.18)]"
                    }`}
                    draggable={false}
                  />
                </button>
              </>
            ) : (
              <Image
                src={placement.image}
                alt=""
                fill
                unoptimized
                sizes="100vw"
                className="pointer-events-none select-none object-contain object-bottom drop-shadow-[0_22px_22px_rgba(52,73,65,0.2)]"
                draggable={false}
              />
            )}
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
          data-map-control
          className="flex size-10 items-center justify-center rounded-md bg-white text-slate-700 shadow-sm"
          aria-label="現在地"
          onClick={locateUser}
          type="button"
        >
          <LocateFixed className="size-5" aria-hidden="true" />
        </button>
      </div>
      {locationError ? (
        <div
          className="absolute inset-0 z-30 flex items-end justify-center bg-slate-950/45 px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-8 backdrop-blur-[2px] sm:items-center"
          data-map-control
        >
          <section className="w-full max-w-md rounded-[30px] bg-white p-4 text-slate-900 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
            <div className="flex items-start justify-between gap-3 px-1 pt-1">
              <div>
                <p className="text-xs font-black text-emerald-600">現在地の設定</p>
                <h2 className="mt-0.5 text-2xl font-black leading-tight text-slate-950">{locationError.title}</h2>
              </div>
              <button
                type="button"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                onClick={() => setLocationError(null)}
                aria-label="閉じる"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-4 px-1 text-sm font-bold leading-relaxed text-slate-700">{locationError.body}</p>
            <ol className="mt-4 grid gap-2 rounded-2xl bg-slate-50 p-3 text-sm font-semibold leading-relaxed text-slate-600">
              {locationError.steps.map((step, index) => (
                <li key={step} className="flex gap-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[0.72rem] font-black text-white">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                className="h-14 flex-1 rounded-2xl bg-emerald-500 px-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(16,185,129,0.35)]"
                onClick={locateUser}
              >
                もう一度試す
              </button>
              <button
                type="button"
                className="h-14 flex-1 rounded-2xl bg-slate-100 px-3 text-sm font-black text-slate-700"
                onClick={() => setLocationError(null)}
              >
                閉じる
              </button>
            </div>
          </section>
        </div>
      ) : null}
      {locationMessage ? (
        <div className="absolute left-4 top-4 z-20 rounded-md bg-white/92 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm">
          {locationMessage}
        </div>
      ) : null}
    </section>
  );
}
