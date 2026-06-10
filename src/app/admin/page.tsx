import Link from "next/link";
import { RoleGate } from "@/components/auth/RoleGate";
import { USER_ROLE } from "@/features/auth/roles";

export default function AdminPage() {
  return (
    <RoleGate allowed={[USER_ROLE.ADMIN]}>
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 md:px-6 md:pb-10">
        <h1 className="text-2xl font-black">運営管理</h1>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Link href="/admin/stores" className="rounded-lg border border-border bg-white p-5 shadow-sm hover:bg-muted">
            <h2 className="font-bold">店舗管理</h2>
            <p className="mt-1 text-sm text-slate-600">店舗の追加・編集・紐付け</p>
          </Link>
          <Link href="/admin/reports" className="rounded-lg border border-border bg-white p-5 shadow-sm hover:bg-muted">
            <h2 className="font-bold">報告確認</h2>
            <p className="mt-1 text-sm text-slate-600">来店記録と混雑報告</p>
          </Link>
          <Link href="/admin/stores/new" className="rounded-lg border border-border bg-white p-5 shadow-sm hover:bg-muted">
            <h2 className="font-bold">店舗追加</h2>
            <p className="mt-1 text-sm text-slate-600">新しい店舗を登録</p>
          </Link>
        </div>
      </main>
    </RoleGate>
  );
}
