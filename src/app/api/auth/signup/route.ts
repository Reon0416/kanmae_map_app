import { NextResponse } from "next/server";
import type { AuthApiResponse } from "@/features/auth/auth-validation";

export async function POST() {
  return NextResponse.json<AuthApiResponse>(
    {
      ok: false,
      status: "failed",
      message: "一般ユーザーの新規登録は不要です。店舗・運営アカウントは運営管理画面で発行してください。"
    },
    { status: 410 }
  );
}
