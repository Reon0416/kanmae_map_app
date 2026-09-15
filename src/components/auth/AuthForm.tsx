"use client";

import { useState } from "react";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuthApiResponse } from "@/features/auth/auth-validation";
import { ROLE_STORAGE_KEY } from "@/features/auth/roles";
import { clearStampSnapshot } from "@/features/visit-records/stamp-snapshot";

type AuthMode = "sign-in" | "sign-up";

export function AuthForm({
  mode,
  redirectTo = "/"
}: {
  mode: AuthMode;
  redirectTo?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isSignUp = mode === "sign-up";

  async function submitAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    clearStampSnapshot();

    const response = await fetch(isSignUp ? "/api/auth/signup" : "/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password,
        displayName,
        redirectTo
      })
    });

    const result = (await response.json()) as AuthApiResponse;

    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    window.localStorage.setItem(ROLE_STORAGE_KEY, result.role);
    window.location.replace(result.redirectTo);
  }

  return (
    <div className="border border-white/70 bg-white/90 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur">
      <form className="grid gap-4" onSubmit={submitAuth}>
        {isSignUp ? (
          <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
            表示名
            <input
              className="h-12 rounded-sm border border-slate-300 bg-white px-3 text-base font-bold text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="関大 太郎"
            />
          </label>
        ) : null}

        <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
          メールアドレス
          <input
            className="h-12 rounded-sm border border-slate-300 bg-white px-3 text-base font-bold text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="name@example.com"
          />
        </label>

        <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
          パスワード
          <input
            className="h-12 rounded-sm border border-slate-300 bg-white px-3 text-base font-bold text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            placeholder="8文字以上"
          />
        </label>

        {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p> : null}
        {message ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">{message}</p> : null}

        <Button className="mt-1 h-12 w-full rounded-sm bg-slate-950 font-black text-white shadow-sm transition hover:bg-slate-800 active:translate-y-px active:scale-[0.99]" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : isSignUp ? (
            <UserPlus className="size-4" aria-hidden="true" />
          ) : (
            <LogIn className="size-4" aria-hidden="true" />
          )}
          {isSignUp ? "アカウントを作成" : "ログイン"}
        </Button>
      </form>

      {!isSignUp ? (
        <p className="mt-5 border-t border-slate-200 pt-4 text-center text-xs font-bold leading-relaxed text-slate-500">
          店舗・運営アカウントは運営管理画面で発行します。
        </p>
      ) : null}
    </div>
  );
}
