import { AdminShell } from "@/components/admin/AdminShell";
import { WaitTimeRowForm } from "@/components/admin/WaitTimeRowForm";
import { getStores } from "@/features/stores/store-queries";

export default async function AdminWaitTimesPage() {
  const stores = await getStores();

  return (
    <AdminShell
      activePath="/admin/wait-times"
      title="待ち時間管理"
      description="各店舗の現在の待ち時間を確認し、運営側で表示値を変更します。"
    >
      <section className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-black text-slate-950">店舗別の待ち時間</h2>
        </div>
        <div className="divide-y divide-slate-200">
          {stores.map((store) => (
            <WaitTimeRowForm key={store.id} store={store} />
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
