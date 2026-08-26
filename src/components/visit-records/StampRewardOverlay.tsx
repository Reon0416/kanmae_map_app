"use client";

import Image from "next/image";
import { Sparkles, X } from "lucide-react";
import type { Store } from "@/features/stores/store-types";

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

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/72 px-6 backdrop-blur-sm">
      <button
        type="button"
        className="absolute right-4 top-[calc(1rem+env(safe-area-inset-top))] flex size-11 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur-md"
        onClick={onClose}
        aria-label="閉じる"
      >
        <X className="size-5" aria-hidden="true" />
      </button>

      <div className="kanmae-stamp-float flex flex-col items-center">
        <div className="relative flex size-44 items-center justify-center rounded-full border-[10px] border-emerald-400/80 bg-white shadow-[0_24px_80px_rgba(16,185,129,0.35)]">
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
