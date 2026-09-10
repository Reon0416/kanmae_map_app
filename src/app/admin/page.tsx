import Link from "next/link";
import { Clock3, Settings, Store } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { RoleGate } from "@/components/auth/RoleGate";
import { WAIT_TIME_LABELS } from "@/constants/wait-time-options";
import { USER_ROLE } from "@/features/auth/roles";
import { getStores } from "@/features/stores/store-queries";

export default function AdminPage() {
  const stores = getStores();
  const latestStore = stores[0];

  return (
    <RoleGate allowed={[USER_ROLE.ADMIN]}>
      <AdminShell
        activePath="/admin"
        title="運営ダッシュボード"
        description="既存のログイン画面で運営者メールアドレスとパスワードを入力した場合に表示される管理画面です。"
      >
        <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <section className="border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-black text-slate-950">現在の待ち時間</h2>
              <Link className="text-sm font-black text-blue-700 underline-offset-4 hover:underline" href="/admin/wait-times">
                変更する
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">店舗名</th>
                    <th className="px-4 py-3">現在の待ち時間</th>
                    <th className="px-4 py-3">営業時間</th>
                    <th className="px-4 py-3">最終更新</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.slice(0, 6).map((store) => (
                    <tr key={store.id} className="border-t border-slate-200">
                      <td className="px-4 py-3 font-black">{store.name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex h-7 items-center rounded-sm bg-blue-50 px-2 text-xs font-black text-blue-800">
                          {WAIT_TIME_LABELS[store.waitTime]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{store.hours}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(store.lastUpdatedAt).toLocaleString("ja-JP", {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="grid gap-4">
            <div className="border border-slate-200 bg-white p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Summary</p>
              <dl className="mt-4 grid gap-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <dt className="text-sm font-bold text-slate-600">登録店舗</dt>
                  <dd className="text-xl font-black">{stores.length}</dd>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <dt className="text-sm font-bold text-slate-600">直近更新店舗</dt>
                  <dd className="text-sm font-black">{latestStore?.name ?? "未登録"}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm font-bold text-slate-600">運営者</dt>
                  <dd className="text-sm font-black">3名</dd>
                </div>
              </dl>
            </div>

            <div className="border border-slate-200 bg-white p-4">
              <h2 className="text-sm font-black">主要操作</h2>
              <div className="mt-4 grid gap-2">
                {[
                  { href: "/admin/wait-times", label: "待ち時間を変更", icon: Clock3 },
                  { href: "/admin/stores", label: "店舗名・営業時間を編集", icon: Store },
                  { href: "/admin/settings", label: "運営者アカウントを追加", icon: Settings }
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex h-11 items-center gap-3 rounded-sm border border-slate-200 px-3 text-sm font-black text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </AdminShell>
    </RoleGate>
  );
}
