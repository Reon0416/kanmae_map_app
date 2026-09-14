"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { markCurrentStoreAvailableFormAction, type StoreAdminActionState } from "@/app/store-admin/actions";

const initialState: StoreAdminActionState = {
  ok: false
};

function AvailableButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-44 w-full flex-col items-center justify-center gap-3 rounded-lg bg-emerald-500 text-white shadow-[0_18px_40px_rgba(16,185,129,0.28)] transition hover:bg-emerald-600 active:translate-y-px disabled:cursor-wait disabled:bg-emerald-400"
    >
      {pending ? <Loader2 className="size-12 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="size-12" aria-hidden="true" />}
      <span className="text-3xl font-black tracking-normal">{pending ? "反映中" : "空席"}</span>
      <span className="text-sm font-black text-emerald-50">
        {pending ? "更新しています" : "押すと待ち時間が0分になります"}
      </span>
    </button>
  );
}

export function StoreAvailableForm() {
  const [state, formAction] = useActionState(markCurrentStoreAvailableFormAction, initialState);

  return (
    <form action={formAction} className="grid gap-3">
      <AvailableButton />
      {state.message ? (
        <p
          className={`rounded-md px-3 py-2 text-center text-sm font-black ${
            state.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
          aria-live="polite"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
