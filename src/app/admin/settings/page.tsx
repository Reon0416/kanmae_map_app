import { KeyRound, Mail, Save, UserPlus, UsersRound } from "lucide-react";
import { createOperatorAction, updateCurrentUserEmailAction, updateCurrentUserPasswordAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/AdminShell";
import { getStores } from "@/features/stores/store-queries";
import { createSupabaseAdminClient, hasSupabaseAdminEnvironment } from "@/lib/supabase/admin";
import { createSupabaseServerClient, hasSupabaseEnvironment } from "@/lib/supabase/server";

type Operator = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

export default async function AdminSettingsPage() {
  const stores = await getStores();
  const supabase = hasSupabaseEnvironment() ? await createSupabaseServerClient() : null;
  const {
    data: { user }
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const { data: profile } =
    supabase && user
      ? await supabase.from("profiles").select("display_name, role").eq("id", user.id).maybeSingle()
      : { data: null };
  const currentEmail = user?.email ?? "";
  const currentName = profile?.display_name || user?.email || "運営者";
  const currentRole = profile?.role === "admin" ? "管理者" : profile?.role === "store" ? "店舗担当" : "ユーザー";
  let operators: Operator[] = user
    ? [{ id: user.id, name: currentName, email: currentEmail, role: currentRole, status: "ログイン中" }]
    : [];

  if (hasSupabaseAdminEnvironment()) {
    const adminSupabase = createSupabaseAdminClient();
    const [{ data: authUsers }, { data: operatorProfiles }] = await Promise.all([
      adminSupabase.auth.admin.listUsers(),
      adminSupabase.from("profiles").select("id, display_name, role").in("role", ["admin", "store"])
    ]);
    const profileById = new Map((operatorProfiles ?? []).map((item) => [item.id, item]));

    operators = (authUsers.users ?? [])
      .map((authUser) => {
        const operatorProfile = profileById.get(authUser.id);
        if (!operatorProfile) return null;

        return {
          id: authUser.id,
          name: operatorProfile.display_name || authUser.email || "運営者",
          email: authUser.email ?? "",
          role: operatorProfile.role === "admin" ? "管理者" : "店舗担当",
          status: authUser.id === user?.id ? "ログイン中" : "有効"
        };
      })
      .filter((operator): operator is Operator => Boolean(operator));
  }

  return (
    <AdminShell
      activePath="/admin/settings"
      title="設定"
      description="運営者アカウント情報の変更と、運営者アカウントの追加を行います。"
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="grid gap-4">
          <form action={updateCurrentUserEmailAction} className="border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <Mail className="size-5 text-slate-500" aria-hidden="true" />
              <h2 className="text-sm font-black text-slate-950">メールアドレス変更</h2>
            </div>
            <div className="mt-4 grid gap-4">
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
                  placeholder="new-admin@example.com"
                  className="h-11 rounded-sm border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>
            <div className="mt-5 flex justify-end border-t border-slate-200 pt-4">
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-slate-800"
              >
                <Save className="size-4" aria-hidden="true" />
                保存
              </button>
            </div>
          </form>

          <form action={updateCurrentUserPasswordAction} className="border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <KeyRound className="size-5 text-slate-500" aria-hidden="true" />
              <h2 className="text-sm font-black text-slate-950">パスワード変更</h2>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                新しいパスワード
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  className="h-11 rounded-sm border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                確認用パスワード
                <input
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className="h-11 rounded-sm border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>
            <div className="mt-5 flex justify-end border-t border-slate-200 pt-4">
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-slate-800"
              >
                <Save className="size-4" aria-hidden="true" />
                更新
              </button>
            </div>
          </form>
        </section>

        <aside className="grid gap-4">
          <form action={createOperatorAction} className="border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <UserPlus className="size-5 text-slate-500" aria-hidden="true" />
                <h2 className="text-sm font-black text-slate-950">運営者アカウント追加</h2>
              </div>
              <div className="mt-4 grid gap-4">
                <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                  運営者名
                  <input
                    name="displayName"
                    placeholder="例: 運営スタッフ"
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
                  <select name="role" className="h-11 rounded-sm border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100">
                    <option value="admin">管理者</option>
                    <option value="store">店舗担当</option>
                  </select>
                </label>
                <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                  担当店舗
                  <select name="storeId" className="h-11 rounded-sm border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100">
                    <option value="">管理者、または後で設定する場合は未選択</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mt-5 flex justify-end border-t border-slate-200 pt-4">
                <button type="submit" className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-blue-700 px-4 text-sm font-black text-white transition hover:bg-blue-800">
                  <UserPlus className="size-4" aria-hidden="true" />
                  作成
                </button>
              </div>
            </form>

            <section className="border border-slate-200 bg-white">
              <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
                <UsersRound className="size-5 text-slate-500" aria-hidden="true" />
                <h2 className="text-sm font-black text-slate-950">現在の運営者アカウント</h2>
              </div>
              <div className="divide-y divide-slate-200">
                {operators.length > 0 ? (
                  operators.map((operator) => (
                    <div key={operator.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-slate-950">{operator.name}</p>
                        <p className="mt-1 text-xs font-bold text-slate-500">{operator.email}</p>
                      </div>
                      <span className="rounded-sm bg-slate-100 px-2 py-1 text-xs font-black text-slate-700">{operator.role}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-700">{operator.status}</span>
                      <span className="text-xs font-bold text-slate-500">{operator.id.slice(0, 8)}</span>
                    </div>
                  </div>
                  ))
                ) : (
                  <p className="px-4 py-5 text-sm font-bold text-slate-500">運営者情報を取得できませんでした。</p>
                )}
              </div>
            </section>
        </aside>
      </div>
    </AdminShell>
  );
}
