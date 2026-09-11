import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { getStores } from "@/features/stores/store-queries";

export default async function AdminStoresPage() {
  const stores = await getStores();

  return (
    <AdminShell
      activePath="/admin/stores"
      title="店舗情報管理"
      description="運営画面では店舗名と営業時間のみを追加・修正できます。"
    >
      <section className="border border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-black text-slate-950">店舗一覧</h2>
          <Link
            href="/admin/stores/new"
            className="inline-flex h-9 items-center gap-2 rounded-sm bg-slate-950 px-3 text-sm font-black text-white transition hover:bg-slate-800"
          >
            <Plus className="size-4" aria-hidden="true" />
            追加
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-4 py-3">店舗</th>
                <th className="px-4 py-3">営業時間</th>
                <th className="px-4 py-3">最終更新</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-black">{store.name}</td>
                  <td className="px-4 py-3 text-slate-700">{store.hours}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(store.lastUpdatedAt).toLocaleString("ja-JP", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/stores/${store.id}`} className="font-black text-blue-700 underline-offset-4 hover:underline">
                      編集
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
