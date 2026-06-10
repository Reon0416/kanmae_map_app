import { NextResponse } from "next/server";
import { z } from "zod";
import { STORE_STATUS } from "@/constants/crowd-status";
import { calculateCurrentStatus } from "@/features/crowd/calculate-current-status";
import { checkRateLimit } from "@/lib/security/rate-limit";

const statusSchema = z.object({
  storeId: z.string().min(1),
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

  const updatedAt = new Date().toISOString();
  const current = calculateCurrentStatus({
    ownerStatus: body.data.status,
    ownerUpdatedAt: updatedAt,
    reports: []
  });

  return NextResponse.json({
    storeId: body.data.storeId,
    ownerStatus: body.data.status,
    current,
    updatedAt
  });
}
