import { NextResponse } from "next/server";
import { getCurrentUserStampData } from "@/features/visit-records/stamp-queries";

export async function GET() {
  const stampData = await getCurrentUserStampData();

  if (!stampData) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  return NextResponse.json(stampData);
}
