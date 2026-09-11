"use client";

import { Loader2, Save } from "lucide-react";
import { useFormStatus } from "react-dom";

export function WaitTimeSubmitButton() {
  const { pending } = useFormStatus();
  const Icon = pending ? Loader2 : Save;

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-slate-950 px-4 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 active:translate-y-px active:scale-[0.98] disabled:cursor-wait disabled:bg-slate-700 disabled:shadow-none"
    >
      <Icon className={pending ? "size-4 animate-spin" : "size-4"} aria-hidden="true" />
      {pending ? "保存中" : "保存"}
    </button>
  );
}
