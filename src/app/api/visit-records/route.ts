import { NextResponse } from "next/server";
import { z } from "zod";
import { WAIT_TIME_BUCKET } from "@/constants/wait-time-options";
import { getStoreById } from "@/features/stores/store-queries";
import { validateVisitLocation } from "@/features/visit-records/validate-location";
import { DEFAULT_VISIT_RADIUS_METERS } from "@/lib/map/map-config";
import { checkRateLimit } from "@/lib/security/rate-limit";

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
  })
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

  const locationResult = validateVisitLocation(
    body.data.location,
    { lat: store.lat, lng: store.lng },
    DEFAULT_VISIT_RADIUS_METERS
  );

  if (!locationResult.isValid) {
    return NextResponse.json({ error: "Store is too far from current location", distance: locationResult.distance }, { status: 403 });
  }

  return NextResponse.json({
    id: crypto.randomUUID(),
    storeId: store.id,
    waitTime: body.data.waitTime,
    visitedAt: new Date().toISOString()
  });
}
