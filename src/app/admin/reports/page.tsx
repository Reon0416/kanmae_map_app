import { RoleGate } from "@/components/auth/RoleGate";
import { USER_ROLE } from "@/features/auth/roles";

export default function AdminReportsPage() {
  return (
    <RoleGate allowed={[USER_ROLE.ADMIN]}>
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 md:px-6 md:pb-10">
        <h1 className="text-2xl font-black">報告確認</h1>
        <div className="mt-5 rounded-lg border border-border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-600">MVP では来店記録と混雑報告の確認欄を用意しています。個人別ランキングや個人履歴の店舗公開は行いません。</p>
        </div>
      </main>
    </RoleGate>
  );
}
