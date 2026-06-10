import { RoleGate } from "@/components/auth/RoleGate";
import { StoreCard } from "@/components/stores/StoreCard";
import { USER_ROLE } from "@/features/auth/roles";
import { getStores } from "@/features/stores/store-queries";

export default function MyPage() {
  const stores = getStores().slice(0, 2);

  return (
    <RoleGate allowed={[USER_ROLE.USER]}>
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-6 md:px-6 md:pb-10">
        <h1 className="text-2xl font-black">マイページ</h1>
        <div className="mt-5 grid gap-4 rounded-lg border border-border bg-white p-5 shadow-sm sm:grid-cols-3">
          <div><p className="text-sm text-slate-500">今月の来店</p><p className="mt-1 text-2xl font-black">4</p></div>
          <div><p className="text-sm text-slate-500">スタンプ</p><p className="mt-1 text-2xl font-black">8</p></div>
          <div><p className="text-sm text-slate-500">よく行く店</p><p className="mt-1 text-lg font-black">関前ラーメン</p></div>
        </div>
        <h2 className="mt-8 text-lg font-bold">最近行った店</h2>
        <div className="mt-3 grid gap-3">
          {stores.map((store) => <StoreCard key={store.id} store={store} />)}
        </div>
      </main>
    </RoleGate>
  );
}
