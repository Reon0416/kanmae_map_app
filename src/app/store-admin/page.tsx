import { Clock3 } from "lucide-react";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { StoreAvailableForm } from "@/components/store-admin/StoreAvailableForm";
import { WAIT_TIME_LABELS } from "@/constants/wait-time-options";
import { ensureProfileAndGetRole } from "@/features/auth/auth-server";
import { USER_ROLE } from "@/features/auth/roles";
import { getCurrentStoreAdminStore } from "@/features/stores/store-admin-queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function StoreAdminPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/store-admin");
  }

  const role = await ensureProfileAndGetRole(supabase, user);

  if (role !== USER_ROLE.STORE) {
    redirect("/");
  }

  const store = await getCurrentStoreAdminStore();

  return (
    <main className="min-h-dvh bg-slate-100 px-4 pb-24 pt-5">
      <div className="mx-auto max-w-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black tracking-[0.18em] text-emerald-700">STORE PAGE</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">店舗用ページ</h1>
          </div>
          <SignOutButton />
        </div>

        {store ? (
          <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <p className="text-xs font-black text-slate-500">担当店舗</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">{store.name}</h2>
              <div className="mt-4 flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">
                <Clock3 className="size-4 text-slate-400" aria-hidden="true" />
                現在の待ち時間: {WAIT_TIME_LABELS[store.waitTime]}
              </div>
            </div>

            <div className="p-5">
              <StoreAvailableForm />
            </div>
          </section>
        ) : (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-base font-black text-amber-950">担当店舗が設定されていません</h2>
            <p className="mt-2 text-sm font-bold text-amber-800">運営管理画面で、この店舗アカウントに担当店舗を紐づけてください。</p>
          </div>
        )}
      </div>
    </main>
  );
}
