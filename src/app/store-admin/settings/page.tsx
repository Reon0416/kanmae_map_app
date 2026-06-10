import { RoleGate } from "@/components/auth/RoleGate";
import { USER_ROLE } from "@/features/auth/roles";

export default function StoreAdminSettingsPage() {
  return (
    <RoleGate allowed={[USER_ROLE.STORE]}>
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-6 md:px-6 md:pb-10">
        <h1 className="text-2xl font-black">店舗設定</h1>
        <form className="mt-5 space-y-4 rounded-lg border border-border bg-white p-5 shadow-sm">
          {["店舗名", "ジャンル", "営業時間", "定休日", "価格帯"].map((label) => (
            <label key={label} className="block">
              <span className="text-sm font-bold text-slate-700">{label}</span>
              <input className="mt-2 h-11 w-full rounded-md border border-border bg-muted px-3 text-sm outline-none focus:ring-2 focus:ring-slate-950" />
            </label>
          ))}
          <button className="h-10 rounded-md bg-slate-950 px-4 text-sm font-bold text-white" type="button">保存</button>
        </form>
      </main>
    </RoleGate>
  );
}
