"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { LogIn } from "lucide-react";
import { ROLE_LABELS, ROLE_STORAGE_KEY, type UserRole } from "@/features/auth/roles";

export function RoleGate({ allowed, children }: { allowed: UserRole[]; children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>();

  useEffect(() => {
    setRole(window.localStorage.getItem(ROLE_STORAGE_KEY) as UserRole | null);
  }, []);

  if (role === undefined) {
    return <main className="mx-auto max-w-3xl px-4 py-10 text-sm text-slate-600">確認中...</main>;
  }

  if (!role || !allowed.includes(role)) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h1 className="text-xl font-black text-slate-950">ログイン種別が違います</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            この画面は {allowed.map((item) => ROLE_LABELS[item]).join(" / ")} 用です。ログイン画面で利用する立場を選んでください。
          </p>
          <Link
            href="/login"
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-bold text-white"
          >
            <LogIn className="size-4" aria-hidden="true" />
            ログイン画面へ
          </Link>
        </div>
      </main>
    );
  }

  return children;
}
