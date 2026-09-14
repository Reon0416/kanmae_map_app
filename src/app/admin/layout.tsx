import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { ensureProfileAndGetRole } from "@/features/auth/auth-server";
import { USER_ROLE } from "@/features/auth/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const role = await ensureProfileAndGetRole(supabase, user);

  if (role !== USER_ROLE.ADMIN) {
    redirect("/");
  }

  return children;
}
