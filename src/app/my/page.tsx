import { RoleGate } from "@/components/auth/RoleGate";
import { VisitStampCard } from "@/components/my/VisitStampCard";
import { USER_ROLE } from "@/features/auth/roles";

export default function MyPage() {
  return (
    <RoleGate allowed={[USER_ROLE.USER]}>
      <main className="pb-24 pt-6 md:mx-auto md:max-w-4xl md:pb-10">
        <h1 className="px-4 text-2xl font-black md:px-6">マイページ</h1>

        <div className="mt-5 md:overflow-hidden md:rounded-lg md:border md:border-border">
          <VisitStampCard />
        </div>
      </main>
    </RoleGate>
  );
}
