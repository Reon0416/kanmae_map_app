"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { UserPlus } from "lucide-react";
import { createOperatorFormAction, type CreateOperatorActionState } from "@/app/admin/actions";

type StoreOption = {
  id: string;
  name: string;
};

const initialState: CreateOperatorActionState = {
  ok: false
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-blue-700 px-4 text-sm font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
    >
      <UserPlus className="size-4" aria-hidden="true" />
      {pending ? "作成中" : "作成"}
    </button>
  );
}

export function CreateOperatorForm({ stores }: { stores: StoreOption[] }) {
  const [state, formAction] = useActionState(createOperatorFormAction, initialState);
  const [role, setRole] = useState("store");

  return (
    <form action={formAction} className="border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <UserPlus className="size-5 text-slate-500" aria-hidden="true" />
        <h2 className="text-sm font-black text-slate-950">店舗・運営アカウント追加</h2>
      </div>
      <div className="mt-4 grid gap-4">
        {state.message ? (
          <p
            className={`rounded-sm px-3 py-2 text-sm font-bold ${
              state.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}
            aria-live="polite"
          >
            {state.message}
          </p>
        ) : null}

        <label className="grid gap-1.5 text-sm font-bold text-slate-700">
          表示名
          <input
            name="displayName"
            placeholder="例: 店舗スタッフ"
            className="h-11 rounded-sm border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-bold text-slate-700">
          メールアドレス
          <input
            name="email"
            type="email"
            placeholder="staff@example.com"
            className="h-11 rounded-sm border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-bold text-slate-700">
          初期パスワード
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            className="h-11 rounded-sm border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-bold text-slate-700">
          権限
          <select
            name="role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="h-11 rounded-sm border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
          >
            <option value="store">店舗担当</option>
            <option value="admin">管理者</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-bold text-slate-700">
          担当店舗
          <select
            name="storeId"
            disabled={role === "admin"}
            className="h-11 rounded-sm border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">管理者の場合は未選択</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-5 flex justify-end border-t border-slate-200 pt-4">
        <SubmitButton />
      </div>
    </form>
  );
}
