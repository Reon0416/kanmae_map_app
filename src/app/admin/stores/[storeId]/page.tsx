import { notFound } from "next/navigation";
import { Save } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { getStoreById } from "@/features/stores/store-queries";

export default async function AdminStoreEditPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const store = getStoreById(storeId);

  if (!store) notFound();

  return (
    <AdminShell activePath="/admin/stores" title="店舗情報編集" description={`${store.name} の店舗名と営業時間を修正します。`}>
      <form className="max-w-3xl border border-slate-200 bg-white p-5">
        <div className="grid gap-4">
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            店舗名
            <input
              defaultValue={store.name}
              className="h-11 rounded-sm border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            営業時間
            <input
              defaultValue={store.hours}
              placeholder="例: 11:00-22:00"
              className="h-11 rounded-sm border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </div>
        <div className="mt-5 flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
          <button type="button" className="h-10 rounded-sm border border-slate-300 px-4 text-sm font-black text-slate-700">
            キャンセル
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-slate-800"
          >
            <Save className="size-4" aria-hidden="true" />
            保存
          </button>
        </div>
      </form>
    </AdminShell>
  );
}
