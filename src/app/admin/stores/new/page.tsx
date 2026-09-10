import { Save } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { RoleGate } from "@/components/auth/RoleGate";
import { USER_ROLE } from "@/features/auth/roles";

export default function NewStorePage() {
  return (
    <RoleGate allowed={[USER_ROLE.ADMIN]}>
      <AdminShell activePath="/admin/stores" title="店舗追加" description="新しい店舗を店舗名と営業時間だけで登録します。">
        <form className="max-w-3xl border border-slate-200 bg-white p-5">
          <div className="grid gap-4">
            <label className="grid gap-1.5 text-sm font-bold text-slate-700">
              店舗名
              <input className="h-11 rounded-sm border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100" />
            </label>
            <label className="grid gap-1.5 text-sm font-bold text-slate-700">
              営業時間
              <input
                placeholder="例: 11:00-22:00"
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
              登録
            </button>
          </div>
        </form>
      </AdminShell>
    </RoleGate>
  );
}
