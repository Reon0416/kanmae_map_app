import { NextResponse } from "next/server";
import { z } from "zod";
import { STORE_STATUS } from "@/constants/crowd-status";
import { ensureProfileAndGetRole } from "@/features/auth/auth-server";
import { USER_ROLE } from "@/features/auth/roles";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const statusSchema = z.object({
  storeId: z.string().uuid(),
  status: z.enum([STORE_STATUS.AVAILABLE, STORE_STATUS.LIMITED, STORE_STATUS.FULL])
});

export async function POST(request: Request) {
  const rateLimit = checkRateLimit("status:update", 30);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = statusSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid status payload" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const role = await ensureProfileAndGetRole(supabase, user);
  if (role !== USER_ROLE.STORE) {
    return NextResponse.json({ error: "Store role required" }, { status: 403 });
  }

  const { data, error } = await supabase.rpc("store_admin_update_status", {
    p_store_id: body.data.storeId,
    p_status: body.data.status
  });

  if (error || !data?.[0]) {
    return NextResponse.json({ error: "Failed to save status" }, { status: 500 });
  }

  return NextResponse.json({
    storeId: body.data.storeId,
    displayStatus: data[0].display_status,
    waitTime: data[0].wait_time,
    updatedAt: data[0].updated_at
  });
}
