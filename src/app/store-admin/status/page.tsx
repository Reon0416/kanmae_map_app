"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { RoleGate } from "@/components/auth/RoleGate";
import { Button } from "@/components/ui/button";
import { STORE_STATUS } from "@/constants/crowd-status";
import { USER_ROLE } from "@/features/auth/roles";
import type { StoreStatus } from "@/features/stores/store-types";
import { cn } from "@/lib/utils";

const options: { value: StoreStatus; label: string; description: string; className: string }[] = [
  { value: STORE_STATUS.AVAILABLE, label: "空席あり", description: "比較的スムーズに案内できる状態", className: "border-emerald-300 bg-emerald-50" },
  { value: STORE_STATUS.LIMITED, label: "残りわずか", description: "空席はあるが、すぐ埋まりそうな状態", className: "border-yellow-300 bg-yellow-50" },
  { value: STORE_STATUS.FULL, label: "満席", description: "すぐには案内しにくい状態", className: "border-red-300 bg-red-50" }
];

export default function StoreAdminStatusPage() {
  const [status, setStatus] = useState<StoreStatus>(STORE_STATUS.AVAILABLE);
  const [savedAt, setSavedAt] = useState<string>();

  return (
    <RoleGate allowed={[USER_ROLE.STORE]}>
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-6 md:px-6 md:pb-10">
        <h1 className="text-2xl font-black">混雑ステータス更新</h1>
        <p className="mt-2 text-sm text-slate-600">店舗側は3択だけを更新します。人数や正確な待ち時間は入力しません。</p>
        <div className="mt-5 grid gap-3">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                "rounded-lg border bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-sm",
                status === option.value ? option.className : "border-border"
              )}
              onClick={() => setStatus(option.value)}
            >
              <span className="text-lg font-black">{option.label}</span>
              <span className="mt-1 block text-sm text-slate-600">{option.description}</span>
            </button>
          ))}
        </div>
        <Button className="mt-5 w-full sm:w-auto" onClick={() => setSavedAt(new Date().toLocaleTimeString("ja-JP"))}>
          <CheckCircle2 className="size-4" aria-hidden="true" />
          更新する
        </Button>
        {savedAt ? <p className="mt-3 text-sm font-semibold text-emerald-700">{savedAt} に更新しました。</p> : null}
      </main>
    </RoleGate>
  );
}
