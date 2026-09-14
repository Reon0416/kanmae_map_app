import { VisitStampCard } from "@/components/my/VisitStampCard";
import { StampLoading } from "@/components/my/CachedStampContent";
import { getStoreSummaries } from "@/features/stores/store-queries";
import { Suspense } from "react";

async function StampContent() {
  const stores = await getStoreSummaries();
  return <VisitStampCard stores={stores} initialStampData={null} />;
}

export default function MyPage() {
  return (
    <main className="pb-24 pt-6 md:mx-auto md:max-w-4xl md:pb-10">
      <div className="flex items-center justify-between gap-4 px-4 md:px-6">
        <h1 className="text-2xl font-black">マイページ</h1>
      </div>

      <div className="mt-5 md:overflow-hidden md:rounded-lg md:border md:border-border">
        <Suspense fallback={<StampLoading />}>
          <StampContent />
        </Suspense>
      </div>
    </main>
  );
}
