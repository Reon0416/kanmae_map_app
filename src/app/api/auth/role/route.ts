import { NextResponse } from "next/server";
import { ensureProfileAndGetRole } from "@/features/auth/auth-server";
import { createSupabaseServerClient, hasSupabaseEnvironment } from "@/lib/supabase/server";

export async function GET() {
  if (!hasSupabaseEnvironment()) {
    return NextResponse.json({ role: null });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ role: null });
  }

  const role = await ensureProfileAndGetRole(supabase, user);

  return NextResponse.json({ role });
}
