import { RoleGate } from "@/components/auth/RoleGate";
import { StoreCard } from "@/components/stores/StoreCard";
import { USER_ROLE } from "@/features/auth/roles";
import { getStores } from "@/features/stores/store-queries";

export default function FavoritesPage() {
  const stores = getStores().filter((store) => store.hasStudentDiscount);

  return (
    <RoleGate allowed={[USER_ROLE.USER]}>
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-6 md:px-6 md:pb-10">
        <h1 className="text-2xl font-black">お気に入り</h1>
        <p className="mt-2 text-sm text-slate-600">保存した店舗をすぐ確認できます。</p>
        <div className="mt-5 grid gap-3">
          {stores.map((store) => <StoreCard key={store.id} store={store} />)}
        </div>
      </main>
    </RoleGate>
  );
}
