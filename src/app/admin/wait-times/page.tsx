import { Save } from "lucide-react";
import { updateWaitTimeAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/AdminShell";
import { WAIT_TIME_BUCKET, WAIT_TIME_LABELS } from "@/constants/wait-time-options";
import { getStores } from "@/features/stores/store-queries";

const waitTimeOptions = Object.values(WAIT_TIME_BUCKET);

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
            <form action={updateWaitTimeAction} key={store.id} className="grid gap-4 px-4 py-4 lg:grid-cols-[1.2fr_220px_180px_auto] lg:items-end">
              <input name="storeId" type="hidden" value={store.id} />
              <div>
                <p className="text-sm font-black text-slate-950">{store.name}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">
                  現在: {WAIT_TIME_LABELS[store.waitTime]} / 最終更新:{" "}
                  {new Date(store.lastUpdatedAt).toLocaleString("ja-JP", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              </div>

              <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                待ち時間
                <select
                  defaultValue={store.waitTime}
                  name="waitTime"
                  className="h-10 rounded-sm border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                >
                  {waitTimeOptions.map((option) => (
                    <option key={option} value={option}>
                      {WAIT_TIME_LABELS[option]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                表示確認
                <input
                  readOnly
                  value={WAIT_TIME_LABELS[store.waitTime]}
                  className="h-10 rounded-sm border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-600 outline-none"
                />
              </label>

              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-slate-800"
              >
                <Save className="size-4" aria-hidden="true" />
                保存
              </button>
            </form>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
