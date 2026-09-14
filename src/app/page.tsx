import { Suspense } from "react";
import { redirect } from "next/navigation";
import { MapHome } from "@/components/map/MapHome";
import { ensureProfileAndGetRole, getRoleHomePath } from "@/features/auth/auth-server";
import { USER_ROLE } from "@/features/auth/roles";
import { getStores } from "@/features/stores/store-queries";
import { createSupabaseServerClient, hasSupabaseEnvironment } from "@/lib/supabase/server";

export default async function HomePage() {
  if (hasSupabaseEnvironment()) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      const role = await ensureProfileAndGetRole(supabase, user);

      if (role !== USER_ROLE.USER) {
        redirect(getRoleHomePath(role));
      }
    }
  }

  const stores = await getStores();

  return (
    <Suspense fallback={null}>
      <MapHome stores={stores} />
    </Suspense>
  );
}
