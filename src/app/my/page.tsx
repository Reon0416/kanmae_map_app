import { SignOutButton } from "@/components/auth/SignOutButton";
import { VisitStampCard } from "@/components/my/VisitStampCard";
import { CachedStampContent, StampLoading } from "@/components/my/CachedStampContent";
import { getStoreSummaries } from "@/features/stores/store-queries";
import { getCurrentUserStampData, toStampDisplayData } from "@/features/visit-records/stamp-queries";
import { getSupabaseServerUser } from "@/lib/supabase/server";
import { Suspense } from "react";

async function FreshStampContent({ userId }: { userId: string }) {
  const [stores, stampData] = await Promise.all([getStoreSummaries(), getCurrentUserStampData()]);
  const displayData = toStampDisplayData(stampData);
  return displayData ? <CachedStampContent userId={userId} value={{
    userId, stores, stampData: displayData, fetchedAt: Date.now()
  }} /> : <VisitStampCard stores={[]} initialStampData={null} />;
}

async function StampContent() {
  const { data: { user }, error } = await getSupabaseServerUser();
  if (!user || error) return <VisitStampCard stores={[]} initialStampData={null} />;
  return <Suspense fallback={<CachedStampContent userId={user.id} />}>
    <FreshStampContent userId={user.id} />
  </Suspense>;
}

export default function MyPage() {
  return (
    <main className="pb-24 pt-6 md:mx-auto md:max-w-4xl md:pb-10">
      <div className="flex items-center justify-between gap-4 px-4 md:px-6">
        <h1 className="text-2xl font-black">マイページ</h1>
        <SignOutButton />
      </div>

      <div className="mt-5 md:overflow-hidden md:rounded-lg md:border md:border-border">
        <Suspense fallback={<StampLoading />}>
          <StampContent />
        </Suspense>
      </div>
    </main>
  );
}
