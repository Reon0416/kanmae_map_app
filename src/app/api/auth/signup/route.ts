import { NextResponse, type NextRequest } from "next/server";
import { signupRequestSchema, type AuthApiResponse } from "@/features/auth/auth-validation";
import { getAuthCallbackUrl, getClientIp, hashEmail, logAuthEvent } from "@/features/auth/auth-server";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createSupabaseServerClient, hasSupabaseEnvironment } from "@/lib/supabase/server";

const confirmationMessage = "確認メールを送信しました。メール内のリンクを開いてログインを完了してください。";

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnvironment()) {
    return NextResponse.json<AuthApiResponse>(
      { ok: false, status: "failed", message: "認証設定が未完了です。" },
      { status: 503 }
    );
  }

  const parsed = signupRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json<AuthApiResponse>(
      { ok: false, status: "invalid_request", message: "入力内容を確認してください。" },
      { status: 400 }
    );
  }

  const ipAddress = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? undefined;
  const ipLimit = checkRateLimit(`auth:signup:ip:${ipAddress}`, 30, 10 * 60_000);

  if (!ipLimit.allowed) {
    return NextResponse.json<AuthApiResponse>(
      { ok: false, status: "rate_limited", message: "少し時間を置いてからもう一度お試しください。" },
      { status: 429 }
    );
  }

  const { email, password, displayName, redirectTo } = parsed.data;
  const emailHash = hashEmail(email);
  const supabase = await createSupabaseServerClient();
  const emailRedirectTo = getAuthCallbackUrl(request, redirectTo);

  const signupResult = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: {
        display_name: displayName,
        role: "user"
      }
    }
  });

  if (signupResult.error) {
    const resendResult = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo
      }
    });

    await logAuthEvent(supabase, {
      eventType: "signup",
      status: resendResult.error ? "failed" : "resent_confirmation",
      emailHash,
      errorCode: signupResult.error.code,
      errorMessage: resendResult.error?.message ?? signupResult.error.message,
      ipAddress,
      userAgent,
      metadata: {
        signup_error: signupResult.error.message,
        resend_error: resendResult.error?.message ?? null
      }
    });

    if (!resendResult.error) {
      return NextResponse.json<AuthApiResponse>({ ok: true, status: "confirmation_required", message: confirmationMessage });
    }

    return NextResponse.json<AuthApiResponse>(
      { ok: false, status: "failed", message: "登録処理に失敗しました。時間を置いてからもう一度お試しください。" },
      { status: 400 }
    );
  }

  const user = signupResult.data.user;
  const normalizedEmail = email.toLowerCase();
  const responseEmail = user?.email?.toLowerCase();

  if (!user || responseEmail !== normalizedEmail) {
    await logAuthEvent(supabase, {
      eventType: "signup",
      status: "invalid_response",
      emailHash,
      userId: user?.id,
      errorMessage: "Supabase signup response did not include the expected user email.",
      ipAddress,
      userAgent,
      metadata: {
        has_user: Boolean(user),
        response_email_matches: responseEmail === normalizedEmail,
        has_session: Boolean(signupResult.data.session)
      }
    });

    return NextResponse.json<AuthApiResponse>(
      { ok: false, status: "failed", message: "登録状態を確認できませんでした。時間を置いてからもう一度お試しください。" },
      { status: 502 }
    );
  }

  await logAuthEvent(supabase, {
    eventType: "signup",
    status: signupResult.data.session ? "signed_in" : "confirmation_required",
    emailHash,
    userId: user.id,
    role: "user",
    ipAddress,
    userAgent,
    metadata: {
      has_session: Boolean(signupResult.data.session),
      email_confirmed: Boolean(user.email_confirmed_at)
    }
  });

  if (!signupResult.data.session) {
    return NextResponse.json<AuthApiResponse>({ ok: true, status: "confirmation_required", message: confirmationMessage });
  }

  return NextResponse.json<AuthApiResponse>({
    ok: true,
    status: "signed_in",
    role: "user",
    redirectTo
  });
}
