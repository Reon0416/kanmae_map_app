import Link from "next/link";
import { RoleGate } from "@/components/auth/RoleGate";
import { StoreStatusBadge } from "@/components/stores/StoreStatusBadge";
import { USER_ROLE } from "@/features/auth/roles";
import { getStores } from "@/features/stores/store-queries";

export default function AdminStoresPage() {
  const stores = getStores();

  return (
    <RoleGate allowed={[USER_ROLE.ADMIN]}>
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-6 md:pb-10">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-black">店舗一覧</h1>
          <Link href="/admin/stores/new" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white">追加</Link>
        </div>
        <div className="mt-5 overflow-hidden rounded-lg border border-border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-xs font-bold text-slate-500">
              <tr>
                <th className="px-4 py-3">店舗</th>
                <th className="px-4 py-3">ジャンル</th>
                <th className="px-4 py-3">状態</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id} className="border-t border-border">
                  <td className="px-4 py-3 font-bold">{store.name}</td>
                  <td className="px-4 py-3">{store.genre}</td>
                  <td className="px-4 py-3"><StoreStatusBadge status={store.status} /></td>
                  <td className="px-4 py-3"><Link href={`/admin/stores/${store.id}`} className="font-bold text-slate-950 underline">編集</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </RoleGate>
  );
}
