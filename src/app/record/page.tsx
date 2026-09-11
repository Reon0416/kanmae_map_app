import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { QuickRecordPanel } from "@/components/visit-records/QuickRecordPanel";
import { getStores } from "@/features/stores/store-queries";

export default async function RecordPage() {
  const stores = await getStores();

  return (
    <main className="min-h-dvh bg-slate-50 pb-24 pt-5">
      <Link href="/" className="mb-4 inline-flex items-center gap-1 px-4 text-sm font-bold text-slate-500">
        <ArrowLeft className="size-4" aria-hidden="true" />
        マップ
      </Link>
      <QuickRecordPanel stores={stores} />
    </main>
  );
}
