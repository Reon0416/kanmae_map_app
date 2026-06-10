import { NextResponse } from "next/server";
import { calculateCurrentStatus } from "@/features/crowd/calculate-current-status";

export async function POST(request: Request) {
  const body = await request.json();
  const current = calculateCurrentStatus({
    ownerStatus: body.ownerStatus,
    ownerUpdatedAt: body.ownerUpdatedAt,
    reports: body.reports ?? []
  });

  return NextResponse.json(current);
}
