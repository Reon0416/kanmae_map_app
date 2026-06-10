import Link from "next/link";
import { Activity, Settings } from "lucide-react";
import { RoleGate } from "@/components/auth/RoleGate";
import { USER_ROLE } from "@/features/auth/roles";

export default function StoreAdminPage() {
  return (
    <RoleGate allowed={[USER_ROLE.STORE]}>
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-6 md:px-6 md:pb-10">
        <h1 className="text-2xl font-black">店舗管理</h1>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Link href="/store-admin/status" className="rounded-lg border border-border bg-white p-5 shadow-sm hover:bg-muted">
            <Activity className="size-6" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-bold">混雑ステータス更新</h2>
            <p className="mt-1 text-sm text-slate-600">空席あり・残りわずか・満席を更新します。</p>
          </Link>
          <Link href="/store-admin/settings" className="rounded-lg border border-border bg-white p-5 shadow-sm hover:bg-muted">
            <Settings className="size-6" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-bold">店舗設定</h2>
            <p className="mt-1 text-sm text-slate-600">営業時間や基本情報を確認します。</p>
          </Link>
        </div>
      </main>
    </RoleGate>
  );
}
