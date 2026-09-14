import { SignOutButton } from "@/components/auth/SignOutButton";
import { VisitStampCard } from "@/components/my/VisitStampCard";
import { getStoreSummaries } from "@/features/stores/store-queries";
import { getCurrentUserStampData, toStampDisplayData } from "@/features/visit-records/stamp-queries";
import { getSupabaseServerUser } from "@/lib/supabase/server";
import { Suspense } from "react";

async function StampContent() {
  const { data: { user }, error } = await getSupabaseServerUser();
  const [stores, stampData] = user && !error
    ? await Promise.all([getStoreSummaries(), getCurrentUserStampData()])
    : [[], null];

  return <VisitStampCard stores={stores} initialStampData={toStampDisplayData(stampData)} />;
}

export default function MyPage() {
  return (
    <main className="pb-24 pt-6 md:mx-auto md:max-w-4xl md:pb-10">
      <div className="flex items-center justify-between gap-4 px-4 md:px-6">
        <h1 className="text-2xl font-black">マイページ</h1>
        <SignOutButton />
      </div>

      <div className="mt-5 md:overflow-hidden md:rounded-lg md:border md:border-border">
        <Suspense fallback={
          <div className="min-h-96 px-4 py-5" role="status" aria-label="スタンプを読み込み中" aria-busy="true">
            <div className="h-96 rounded-lg bg-slate-100 motion-safe:animate-pulse" aria-hidden="true" />
          </div>
        }>
          <StampContent />
        </Suspense>
      </div>
    </main>
  );
}
