import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RoleGate } from "@/components/auth/RoleGate";
import { QuickRecordPanel } from "@/components/visit-records/QuickRecordPanel";
import { USER_ROLE } from "@/features/auth/roles";
import { getStores } from "@/features/stores/store-queries";

export default function RecordPage() {
  const stores = getStores();

  return (
    <RoleGate allowed={[USER_ROLE.USER]}>
      <main className="mx-auto max-w-3xl bg-slate-50 px-4 pb-24 pt-5">
        <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-slate-500">
          <ArrowLeft className="size-4" aria-hidden="true" />
          マップ
        </Link>
        <QuickRecordPanel stores={stores} />
      </main>
    </RoleGate>
  );
}
