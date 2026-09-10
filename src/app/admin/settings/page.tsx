import { KeyRound, Mail, Save, UserPlus, UsersRound } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { RoleGate } from "@/components/auth/RoleGate";
import { USER_ROLE } from "@/features/auth/roles";

const operators = [
  { name: "KANMAE 管理者", email: "admin@kanmae.example", role: "管理者", status: "有効" },
  { name: "運営スタッフ A", email: "staff-a@kanmae.example", role: "スタッフ", status: "有効" },
  { name: "運営スタッフ B", email: "staff-b@kanmae.example", role: "スタッフ", status: "有効" }
];

export default function AdminSettingsPage() {
  return (
    <RoleGate allowed={[USER_ROLE.ADMIN]}>
      <AdminShell
        activePath="/admin/settings"
        title="設定"
        description="運営者アカウント情報の変更と、運営者アカウントの追加を行います。"
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="grid gap-4">
            <form className="border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <Mail className="size-5 text-slate-500" aria-hidden="true" />
                <h2 className="text-sm font-black text-slate-950">メールアドレス変更</h2>
              </div>
              <div className="mt-4 grid gap-4">
                <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                  現在のメールアドレス
                  <input
                    readOnly
                    value="admin@kanmae.example"
                    className="h-11 rounded-sm border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-600 outline-none"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                  新しいメールアドレス
                  <input
                    type="email"
                    placeholder="new-admin@example.com"
                    className="h-11 rounded-sm border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>
              <div className="mt-5 flex justify-end border-t border-slate-200 pt-4">
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-slate-800"
                >
                  <Save className="size-4" aria-hidden="true" />
                  保存
                </button>
              </div>
            </form>

            <form className="border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <KeyRound className="size-5 text-slate-500" aria-hidden="true" />
                <h2 className="text-sm font-black text-slate-950">パスワード変更</h2>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-bold text-slate-700 md:col-span-2">
                  現在のパスワード
                  <input
                    type="password"
                    autoComplete="current-password"
                    className="h-11 rounded-sm border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                  新しいパスワード
                  <input
                    type="password"
                    autoComplete="new-password"
                    className="h-11 rounded-sm border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                  確認用パスワード
                  <input
                    type="password"
                    autoComplete="new-password"
                    className="h-11 rounded-sm border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>
              <div className="mt-5 flex justify-end border-t border-slate-200 pt-4">
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-slate-800"
                >
                  <Save className="size-4" aria-hidden="true" />
                  更新
                </button>
              </div>
            </form>
          </section>

          <aside className="grid gap-4">
            <form className="border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <UserPlus className="size-5 text-slate-500" aria-hidden="true" />
                <h2 className="text-sm font-black text-slate-950">運営者アカウント追加</h2>
              </div>
              <div className="mt-4 grid gap-4">
                <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                  運営者名
                  <input
                    placeholder="例: 運営スタッフ"
                    className="h-11 rounded-sm border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                  メールアドレス
                  <input
                    type="email"
                    placeholder="staff@example.com"
                    className="h-11 rounded-sm border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                  初期パスワード
                  <input
                    type="password"
                    autoComplete="new-password"
                    className="h-11 rounded-sm border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                  権限
                  <select className="h-11 rounded-sm border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100">
                    <option>管理者</option>
                    <option>スタッフ</option>
                  </select>
                </label>
              </div>
              <div className="mt-5 flex justify-end border-t border-slate-200 pt-4">
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-blue-700 px-4 text-sm font-black text-white transition hover:bg-blue-800"
                >
                  <UserPlus className="size-4" aria-hidden="true" />
                  作成
                </button>
              </div>
            </form>

            <section className="border border-slate-200 bg-white">
              <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
                <UsersRound className="size-5 text-slate-500" aria-hidden="true" />
                <h2 className="text-sm font-black text-slate-950">運営者一覧</h2>
              </div>
              <div className="divide-y divide-slate-200">
                {operators.map((operator) => (
                  <div key={operator.email} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-slate-950">{operator.name}</p>
                        <p className="mt-1 text-xs font-bold text-slate-500">{operator.email}</p>
                      </div>
                      <span className="rounded-sm bg-slate-100 px-2 py-1 text-xs font-black text-slate-700">{operator.role}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-700">{operator.status}</span>
                      <button type="button" className="text-xs font-black text-red-700 underline-offset-4 hover:underline">
                        無効化
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </AdminShell>
    </RoleGate>
  );
}
