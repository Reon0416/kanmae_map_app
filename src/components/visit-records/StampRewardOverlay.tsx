"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import type { Store } from "@/features/stores/store-types";

const DISMISS_DELAY_MS = 1400;

const STAMP_IMAGE_BY_STORE: Partial<Record<string, string>> = {
  // Example: tonpuku: "/stamps/tonpuku.png"
};

export function StampRewardOverlay({
  store,
  onClose
}: {
  store: Store;
  onClose: () => void;
}) {
  const stampImage = STAMP_IMAGE_BY_STORE[store.id];
  const [canDismiss, setCanDismiss] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setCanDismiss(true), DISMISS_DELAY_MS);
    return () => window.clearTimeout(timer);
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
