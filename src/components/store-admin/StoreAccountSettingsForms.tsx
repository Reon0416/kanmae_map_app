"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { KeyRound, Mail, Save } from "lucide-react";
import {
  updateStoreAdminEmailFormAction,
  updateStoreAdminPasswordFormAction,
  type StoreAdminActionState
} from "@/app/store-admin/actions";

const initialState: StoreAdminActionState = {
  ok: false
};

function FormMessage({ state }: { state: StoreAdminActionState }) {
  if (!state.message) return null;

  return (
    <p
      className={`rounded-md px-3 py-2 text-sm font-bold ${
        state.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      }`}
      aria-live="polite"
    >
      {state.message}
    </p>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:bg-slate-400"
    >
      <Save className="size-4" aria-hidden="true" />
      {pending ? "保存中" : label}
    </button>
  );
}

export function StoreAccountSettingsForms({ currentEmail }: { currentEmail: string }) {
  const [emailState, emailAction] = useActionState(updateStoreAdminEmailFormAction, initialState);
  const [passwordState, passwordAction] = useActionState(updateStoreAdminPasswordFormAction, initialState);

  return (
    <div className="grid gap-4">
      <form action={emailAction} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <Mail className="size-5 text-slate-500" aria-hidden="true" />
          <h2 className="text-sm font-black text-slate-950">メールアドレス変更</h2>
        </div>
        <div className="mt-4 grid gap-4">
          <FormMessage state={emailState} />
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            現在のメールアドレス
            <input
              readOnly
              value={currentEmail}
              className="h-11 rounded-sm border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-600 outline-none"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            新しいメールアドレス
            <input
              name="email"
              type="email"
              placeholder="new-store@example.com"
              className="h-11 rounded-sm border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
        </div>
        <div className="mt-5 flex justify-end border-t border-slate-200 pt-4">
          <SubmitButton label="保存" />
        </div>
      </form>

      <form action={passwordAction} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <KeyRound className="size-5 text-slate-500" aria-hidden="true" />
          <h2 className="text-sm font-black text-slate-950">パスワード変更</h2>
        </div>
        <div className="mt-4 grid gap-4">
          <FormMessage state={passwordState} />
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            新しいパスワード
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              className="h-11 rounded-sm border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            確認用パスワード
            <input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="h-11 rounded-sm border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
        </div>
        <div className="mt-5 flex justify-end border-t border-slate-200 pt-4">
          <SubmitButton label="更新" />
        </div>
      </form>
    </div>
  );
}
