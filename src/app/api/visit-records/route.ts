import { NextResponse } from "next/server";
import { z } from "zod";
import { WAIT_TIME_BUCKET } from "@/constants/wait-time-options";
import { getStoreById } from "@/features/stores/store-queries";
import { validateVisitLocation } from "@/features/visit-records/validate-location";
import { DEFAULT_VISIT_RADIUS_METERS } from "@/lib/map/map-config";
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

  const store = getStoreById(body.data.storeId);
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  if (body.data.location) {
    const locationResult = validateVisitLocation(
      body.data.location,
      { lat: store.lat, lng: store.lng },
      DEFAULT_VISIT_RADIUS_METERS
    );

    if (!locationResult.isValid) {
      return NextResponse.json({ error: "Store is too far from current location", distance: locationResult.distance }, { status: 403 });
    }
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("record_visit_stamp", {
    p_store_key: store.id,
    p_store_name: store.name,
    p_wait_time: body.data.waitTime
  });

  if (error || !data?.[0]) {
    return NextResponse.json({ error: "Failed to save visit record" }, { status: 500 });
  }

  return NextResponse.json({
    id: data[0].event_id,
    storeId: store.id,
    storeName: store.name,
    waitTime: body.data.waitTime,
    stampCount: data[0].stamp_count,
    visitedAt: data[0].stamped_at
  });
}
