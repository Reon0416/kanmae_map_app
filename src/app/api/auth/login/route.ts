import { NextResponse, type NextRequest } from "next/server";
import { ensureProfileAndGetRole, getClientIp, getPostAuthRedirectPath, hashEmail, logAuthEvent } from "@/features/auth/auth-server";
import { loginRequestSchema, type AuthApiResponse } from "@/features/auth/auth-validation";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createSupabaseServerClient, hasSupabaseEnvironment } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnvironment()) {
    return NextResponse.json<AuthApiResponse>(
      { ok: false, status: "failed", message: "認証設定が未完了です。" },
      { status: 503 }
    );
  }

  const parsed = loginRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json<AuthApiResponse>(
      { ok: false, status: "invalid_request", message: "入力内容を確認してください。" },
      { status: 400 }
    );
  }

  const ipAddress = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? undefined;
  const { email, password, redirectTo } = parsed.data;
  const emailHash = hashEmail(email);
  const rateLimit = checkRateLimit(`auth:login:${ipAddress}:${emailHash}`, 10, 10 * 60_000);
  const supabase = await createSupabaseServerClient();

  if (!rateLimit.allowed) {
    await logAuthEvent(supabase, {
      eventType: "login",
      status: "rate_limited",
      emailHash,
      ipAddress,
      userAgent
    });

    return NextResponse.json<AuthApiResponse>(
      { ok: false, status: "rate_limited", message: "少し時間を置いてからもう一度お試しください。" },
      { status: 429 }
    );
  }

  const loginResult = await supabase.auth.signInWithPassword({ email, password });

  if (loginResult.error || !loginResult.data.user || !loginResult.data.session) {
    await logAuthEvent(supabase, {
      eventType: "login",
      status: "failed",
      emailHash,
      userId: loginResult.data.user?.id,
      errorCode: loginResult.error?.code,
      errorMessage: loginResult.error?.message ?? "Supabase login response did not include user and session.",
      ipAddress,
      userAgent,
      metadata: {
        has_user: Boolean(loginResult.data.user),
        has_session: Boolean(loginResult.data.session)
      }
    });

    return NextResponse.json<AuthApiResponse>(
      { ok: false, status: "failed", message: "メールアドレスまたはパスワードが正しくありません。" },
      { status: 401 }
    );
  }

  const role = await ensureProfileAndGetRole(supabase, loginResult.data.user);

  await logAuthEvent(supabase, {
    eventType: "login",
    status: "signed_in",
    emailHash,
    userId: loginResult.data.user.id,
    role,
    ipAddress,
    userAgent,
    metadata: {
      email_confirmed: Boolean(loginResult.data.user.email_confirmed_at)
    }
  });

  return NextResponse.json<AuthApiResponse>({
    ok: true,
    status: "signed_in",
    role,
    redirectTo: getPostAuthRedirectPath(role, redirectTo)
  });
}
