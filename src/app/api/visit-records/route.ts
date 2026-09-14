import { NextResponse } from "next/server";
import { z } from "zod";
import { WAIT_TIME_BUCKET } from "@/constants/wait-time-options";
import { getStoreSummaries } from "@/features/stores/store-queries";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const visitRecordSchema = z.object({
  storeId: z.string().min(1),
  waitTime: z.enum([
    WAIT_TIME_BUCKET.NO_WAIT,
    WAIT_TIME_BUCKET.WITHIN_5,
    WAIT_TIME_BUCKET.BETWEEN_5_10,
    WAIT_TIME_BUCKET.BETWEEN_10_20,
    WAIT_TIME_BUCKET.OVER_20
  ]),
  location: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional()
});

export async function POST(request: Request) {
  const rateLimit = checkRateLimit("visit-record:create", 20);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = visitRecordSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid visit payload" }, { status: 400 });
  }

  const started = performance.now();
  const supabase = await createSupabaseServerClient();
  const [stores, userResult] = await Promise.all([
    getStoreSummaries(),
    supabase.auth.getUser()
  ]);
  const verifiedAt = performance.now();
  const {
    data: { user },
    error: userError
  } = userResult;

  if (userError || !user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const store = stores.find(store => store.id === body.data.storeId);
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const stampStoreKey = store.assetKey ?? store.id;

  const { data, error } = await supabase.rpc("record_visit_stamp", {
    p_store_key: stampStoreKey,
    p_store_name: store.name,
    p_wait_time: body.data.waitTime
  });

  if (error || !data?.[0]) {
    return NextResponse.json({ error: "Failed to save visit record" }, { status: 500 });
  }
  const stampedAt = performance.now();

  const { error: crowdError } = await supabase.rpc("report_crowd_wait_time", {
    p_store_id: store.id,
    p_wait_time: body.data.waitTime
  });

  // The stamp is already committed. A crowd-update failure must not invite a duplicate retry.
  return NextResponse.json({
    id: data[0].event_id,
    storeId: stampStoreKey,
    storeName: store.name,
    waitTime: body.data.waitTime,
    stampCount: data[0].stamp_count,
    visitedAt: data[0].stamped_at,
    crowdStatusUpdated: !crowdError
  }, {
    headers: {
      "Server-Timing": `verify;dur=${(verifiedAt - started).toFixed(1)}, stamp;dur=${(stampedAt - verifiedAt).toFixed(1)}, crowd;dur=${(performance.now() - stampedAt).toFixed(1)}`
    }
  });
}
