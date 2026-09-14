import { SignOutButton } from "@/components/auth/SignOutButton";
import { VisitStampCard } from "@/components/my/VisitStampCard";
import { getStoreSummaries } from "@/features/stores/store-queries";
import { getCurrentUserStampData } from "@/features/visit-records/stamp-queries";
import { getSupabaseServerUser } from "@/lib/supabase/server";

export default async function MyPage() {
  const { data: { user }, error } = await getSupabaseServerUser();
  const [stores, stampData] = user && !error
    ? await Promise.all([getStoreSummaries(), getCurrentUserStampData()])
    : [[], null];

  return (
    <main className="pb-24 pt-6 md:mx-auto md:max-w-4xl md:pb-10">
      <div className="flex items-center justify-between gap-4 px-4 md:px-6">
        <h1 className="text-2xl font-black">マイページ</h1>
        <SignOutButton />
      </div>

      <div className="mt-5 md:overflow-hidden md:rounded-lg md:border md:border-border">
        <VisitStampCard stores={stores} initialStampData={stampData} />
      </div>
    </main>
  );
}
