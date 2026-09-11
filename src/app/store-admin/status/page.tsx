import { CheckCircle2 } from "lucide-react";
import { updateStoreAdminStatusAction } from "@/app/store-admin/actions";
import { STORE_STATUS, STATUS_LABELS } from "@/constants/crowd-status";
import { getCurrentStoreAdminStore } from "@/features/stores/store-admin-queries";
import type { StoreStatus } from "@/features/stores/store-types";
import { cn } from "@/lib/utils";

const options: { value: StoreStatus; label: string; description: string; className: string }[] = [
  { value: STORE_STATUS.AVAILABLE, label: "空席あり", description: "比較的スムーズに案内できる状態", className: "border-emerald-300 bg-emerald-50" },
  { value: STORE_STATUS.LIMITED, label: "残りわずか", description: "空席はあるが、すぐ埋まりそうな状態", className: "border-yellow-300 bg-yellow-50" },
  { value: STORE_STATUS.FULL, label: "満席", description: "すぐには案内しにくい状態", className: "border-red-300 bg-red-50" }
];

export default async function StoreAdminStatusPage() {
  const store = await getCurrentStoreAdminStore();

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-6 md:px-6 md:pb-10">
      <h1 className="text-2xl font-black">混雑ステータス更新</h1>
      {store ? (
        <>
          <div className="mt-4 border border-slate-200 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">担当店舗</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">{store.name}</h2>
            <p className="mt-2 text-sm font-bold text-slate-600">
              現在: {STATUS_LABELS[store.status]} / 最終更新{" "}
              {new Date(store.lastUpdatedAt).toLocaleString("ja-JP", {
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            {options.map((option) => (
              <form action={updateStoreAdminStatusAction} key={option.value}>
                <input name="storeId" type="hidden" value={store.id} />
                <input name="status" type="hidden" value={option.value} />
                <button
                  type="submit"
                  className={cn(
                    "w-full border bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-sm",
                    store.status === option.value ? option.className : "border-border"
                  )}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span>
                      <span className="text-lg font-black">{option.label}</span>
                      <span className="mt-1 block text-sm text-slate-600">{option.description}</span>
                    </span>
                    {store.status === option.value ? <CheckCircle2 className="size-5 text-emerald-600" aria-hidden="true" /> : null}
                  </span>
                </button>
              </form>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-5 border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-base font-black text-amber-950">担当店舗が設定されていません</h2>
          <p className="mt-2 text-sm font-bold text-amber-800">運営管理画面で、この店舗担当アカウントに担当店舗を紐づけてください。</p>
        </div>
      )}
    </main>
  );
}
