"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { ROLE_STORAGE_KEY } from "@/features/auth/roles";
import { clearStampSnapshot } from "@/features/visit-records/stamp-snapshot";

export function SignOutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    setIsSigningOut(true);
    clearStampSnapshot();
    const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.localStorage.removeItem(ROLE_STORAGE_KEY);
    window.location.replace("/login");
  }

  return (
    <button
      type="button"
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-white px-3 text-sm font-black text-slate-700 shadow-sm"
      onClick={signOut}
      disabled={isSigningOut}
    >
      <LogOut className="size-4" aria-hidden="true" />
      {isSigningOut ? "ログアウト中" : "ログアウト"}
    </button>
  );
}
