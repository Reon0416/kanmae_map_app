import { NextResponse } from "next/server";
import { z } from "zod";
import { WAIT_TIME_BUCKET } from "@/constants/wait-time-options";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const crowdReportSchema = z.object({
  storeId: z.string().uuid(),
  waitTime: z.enum([
    WAIT_TIME_BUCKET.NO_WAIT,
    WAIT_TIME_BUCKET.WITHIN_5,
    WAIT_TIME_BUCKET.BETWEEN_5_10,
    WAIT_TIME_BUCKET.BETWEEN_10_20,
    WAIT_TIME_BUCKET.OVER_20
  ])
});

export async function POST(request: Request) {
  const rateLimit = checkRateLimit("crowd-report:create", 30);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = crowdReportSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid crowd report payload" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("report_crowd_wait_time", {
    p_store_id: body.data.storeId,
    p_wait_time: body.data.waitTime
  });

  if (error || !data?.[0]) {
    return NextResponse.json({ error: "Failed to save crowd report" }, { status: 500 });
  }

  return NextResponse.json({
    storeId: body.data.storeId,
    displayStatus: data[0].display_status,
    waitTime: data[0].wait_time,
    updatedAt: data[0].updated_at
  });
}
