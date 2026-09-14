import { NextResponse } from "next/server";
import { getAnonymousStampData, toStampDisplayData } from "@/features/visit-records/stamp-queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const visitorId = searchParams.get("visitorId");

  if (!visitorId) {
    return NextResponse.json({ error: "Anonymous visitor id required" }, { status: 400 });
  }

  try {
    const stampData = await getAnonymousStampData(visitorId);
    return NextResponse.json(toStampDisplayData(stampData), {
      headers: { "Cache-Control": "private, no-store" }
    });
  } catch {
    return NextResponse.json({ error: "Failed to load stamp data" }, { status: 500 });
  }
}
