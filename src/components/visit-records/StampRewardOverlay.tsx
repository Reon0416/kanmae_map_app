"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import type { Store } from "@/features/stores/store-types";
import { getStampImage } from "@/features/visit-records/stamp-images";

const DISMISS_DELAY_MS = 1400;
const STAMP_SOUND_SRC = "/sounds/stamp.m4a";
const SOUND_START_DELAY_MS = 0;
const SOUND_VOLUME = 1;
const SOUND_FADE_OUT_START_MS = 650;
const SOUND_FADE_OUT_DURATION_MS = 350;
const SOUND_STOP_MS = 1000;
const SOUND_FADE_STEPS = 12;

export function StampRewardOverlay({
  store,
  onClose
}: {
  store: Store;
  onClose: () => void;
}) {
  const stampImage = getStampImage(store.id);
  const [canDismiss, setCanDismiss] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setCanDismiss(true), DISMISS_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const sound = new Audio(STAMP_SOUND_SRC);
    const timers: number[] = [];
    sound.volume = SOUND_VOLUME;

    timers.push(window.setTimeout(() => {
      sound.currentTime = 0;
      sound.play().catch(() => {
        // Some browsers block sound if the record action is not treated as a user gesture.
      });
    }, SOUND_START_DELAY_MS));

    timers.push(window.setTimeout(() => {
      const fadeIntervalMs = SOUND_FADE_OUT_DURATION_MS / SOUND_FADE_STEPS;

      for (let step = 1; step <= SOUND_FADE_STEPS; step += 1) {
        timers.push(window.setTimeout(() => {
          sound.volume = Math.max(0, SOUND_VOLUME * (1 - step / SOUND_FADE_STEPS));
        }, fadeIntervalMs * step));
      }
    }, SOUND_START_DELAY_MS + SOUND_FADE_OUT_START_MS));

    timers.push(window.setTimeout(() => {
      sound.pause();
      sound.currentTime = 0;
    }, SOUND_START_DELAY_MS + SOUND_STOP_MS));

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      sound.pause();
    };
  }, []);

  const closeIfReady = () => {
    if (canDismiss) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/72 px-6 backdrop-blur-sm"
      onClick={closeIfReady}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          closeIfReady();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={canDismiss ? "スタンプを閉じる" : "スタンプを表示中"}
    >
      <button
        type="button"
        className="absolute right-4 top-[calc(1rem+env(safe-area-inset-top))] flex size-11 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur-md transition disabled:pointer-events-none disabled:opacity-0"
        onClick={(event) => {
          event.stopPropagation();
          closeIfReady();
        }}
        disabled={!canDismiss}
        aria-label="閉じる"
      >
        <X className="size-5" aria-hidden="true" />
      </button>

      <div className="kanmae-stamp-float flex flex-col items-center">
        <div className="kanmae-stamp-impact relative flex size-44 items-center justify-center rounded-full border-[10px] border-emerald-400/80 bg-white shadow-[0_24px_80px_rgba(16,185,129,0.35)]">
          <div className="absolute inset-3 rounded-full border-2 border-emerald-200" />
          {stampImage ? (
            <Image
              src={stampImage}
              alt={`${store.name}のスタンプ`}
              width={132}
              height={132}
              className="relative z-10 size-32 rounded-full object-contain"
            />
          ) : (
            <div className="relative z-10 flex size-32 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Sparkles className="size-16" aria-hidden="true" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
