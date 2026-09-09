"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuthApiResponse } from "@/features/auth/auth-validation";
import { ROLE_STORAGE_KEY } from "@/features/auth/roles";

type AuthMode = "sign-in" | "sign-up";

export function AuthForm({
  mode,
  redirectTo = "/my"
}: {
  mode: AuthMode;
  redirectTo?: string;
}) {
  const router = useRouter();
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

    if (result.status === "confirmation_required") {
      setMessage(result.message);
      return;
    }

    window.localStorage.setItem(ROLE_STORAGE_KEY, result.role);
    router.refresh();
    router.push(result.redirectTo);
  }

  return (
    <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <form className="grid gap-3" onSubmit={submitAuth}>
        {isSignUp ? (
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            表示名
            <input
              className="h-12 rounded-md border border-border px-3 text-base font-semibold outline-none focus:border-emerald-500"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="関大 太郎"
            />
          </label>
        ) : null}

        <label className="grid gap-1.5 text-sm font-bold text-slate-700">
          メールアドレス
          <input
            className="h-12 rounded-md border border-border px-3 text-base font-semibold outline-none focus:border-emerald-500"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="name@example.com"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-bold text-slate-700">
          パスワード
          <input
            className="h-12 rounded-md border border-border px-3 text-base font-semibold outline-none focus:border-emerald-500"
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

        <Button className="mt-1 h-12 w-full font-black" type="submit" disabled={isSubmitting}>
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

      <div className="mt-4 border-t border-border pt-4 text-center text-sm font-bold text-slate-600">
        {isSignUp ? (
          <>
            すでにアカウントがある場合は{" "}
            <Link className="text-emerald-700 underline-offset-4 hover:underline" href={`/login?next=${encodeURIComponent(redirectTo)}`}>
              ログイン
            </Link>
          </>
        ) : (
          <>
            はじめて使う場合は{" "}
            <Link className="text-emerald-700 underline-offset-4 hover:underline" href={`/signup?next=${encodeURIComponent(redirectTo)}`}>
              新規登録
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
