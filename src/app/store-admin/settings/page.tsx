import { Save } from "lucide-react";
import { updateStoreAdminSettingsAction } from "@/app/store-admin/actions";
import { getCurrentStoreAdminStore } from "@/features/stores/store-admin-queries";

const priceOptions = [
  { value: "under_800", label: "800円未満" },
  { value: "800_1200", label: "800-1,200円" },
  { value: "1200_1800", label: "1,200-1,800円" },
  { value: "over_1800", label: "1,800円以上" }
];

export default async function StoreAdminSettingsPage() {
  const store = await getCurrentStoreAdminStore();

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-6 md:px-6 md:pb-10">
      <h1 className="text-2xl font-black">店舗設定</h1>
      {store ? (
        <form action={updateStoreAdminSettingsAction} className="mt-5 space-y-4 border border-border bg-white p-5 shadow-sm">
          <input name="storeId" type="hidden" value={store.id} />
          <label className="block">
            <span className="text-sm font-bold text-slate-700">店舗名</span>
            <input
              name="name"
              defaultValue={store.name}
              className="mt-2 h-11 w-full rounded-sm border border-border bg-white px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-slate-950"
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">ジャンル</span>
            <input
              name="genre"
              defaultValue={store.genre}
              className="mt-2 h-11 w-full rounded-sm border border-border bg-white px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-slate-950"
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">営業時間</span>
            <input
              name="hours"
              defaultValue={store.hours}
              placeholder="例: 11:00-22:00"
              className="mt-2 h-11 w-full rounded-sm border border-border bg-white px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-slate-950"
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">定休日</span>
            <input
              name="closed"
              defaultValue={store.closed}
              placeholder="例: 水曜"
              className="mt-2 h-11 w-full rounded-sm border border-border bg-white px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-slate-950"
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">価格帯</span>
            <select
              name="priceBand"
              defaultValue={store.priceBand}
              className="mt-2 h-11 w-full rounded-sm border border-border bg-white px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-slate-950"
            >
              {priceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex justify-end border-t border-slate-200 pt-4">
            <button className="inline-flex h-10 items-center gap-2 rounded-sm bg-slate-950 px-4 text-sm font-bold text-white" type="submit">
              <Save className="size-4" aria-hidden="true" />
              保存
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-5 border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-base font-black text-amber-950">担当店舗が設定されていません</h2>
          <p className="mt-2 text-sm font-bold text-amber-800">運営管理画面で、この店舗担当アカウントに担当店舗を紐づけてください。</p>
        </div>
      )}
    </main>
  );
}
