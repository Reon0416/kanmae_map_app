import { RoleGate } from "@/components/auth/RoleGate";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { VisitStampCard } from "@/components/my/VisitStampCard";
import { USER_ROLE } from "@/features/auth/roles";
import { getStores } from "@/features/stores/store-queries";

export default async function MyPage() {
  const stores = await getStores();

  return (
    <RoleGate allowed={[USER_ROLE.USER]}>
      <main className="pb-24 pt-6 md:mx-auto md:max-w-4xl md:pb-10">
        <div className="flex items-center justify-between gap-4 px-4 md:px-6">
          <h1 className="text-2xl font-black">マイページ</h1>
          <SignOutButton />
        </div>

        <div className="mt-5 md:overflow-hidden md:rounded-lg md:border md:border-border">
          <VisitStampCard stores={stores} />
        </div>
      </main>
    </RoleGate>
  );
}
