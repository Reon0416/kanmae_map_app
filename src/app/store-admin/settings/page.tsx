import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { StoreAccountSettingsForms } from "@/components/store-admin/StoreAccountSettingsForms";
import { ensureProfileAndGetRole } from "@/features/auth/auth-server";
import { USER_ROLE } from "@/features/auth/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function StoreAdminSettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/store-admin/settings");
  }

  const role = await ensureProfileAndGetRole(supabase, user);

  if (role !== USER_ROLE.STORE) {
    redirect("/");
  }

  return (
    <main className="min-h-dvh bg-slate-100 px-4 pb-24 pt-5">
      <div className="mx-auto max-w-xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black tracking-[0.18em] text-emerald-700">STORE SETTINGS</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">設定</h1>
          </div>
          <Link
            href="/store-admin"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-white px-3 text-sm font-black text-slate-700 shadow-sm"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            戻る
          </Link>
        </div>

        <StoreAccountSettingsForms currentEmail={user.email ?? ""} />
      </div>
    </main>
  );
}
