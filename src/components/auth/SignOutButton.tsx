"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { ROLE_STORAGE_KEY } from "@/features/auth/roles";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    setIsSigningOut(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.localStorage.removeItem(ROLE_STORAGE_KEY);
    router.refresh();
    router.push("/login");
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
