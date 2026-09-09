import { NextResponse, type NextRequest } from "next/server";
import { ensureProfileAndGetRole, getClientIp, getRoleHomePath, logAuthEvent } from "@/features/auth/auth-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getSafeRedirectPath(next: string | null) {
  if (!next?.startsWith("/") || next.startsWith("//")) {
    return "/my";
  }

  return next;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = getSafeRedirectPath(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    const role = data.user ? await ensureProfileAndGetRole(supabase, data.user) : undefined;

    await logAuthEvent(supabase, {
      eventType: "email_callback",
      status: error ? "failed" : "session_exchanged",
      userId: data.user?.id,
      role,
      errorCode: error?.code,
      errorMessage: error?.message,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") ?? undefined
    });

    if (role && redirectTo === "/my") {
      return NextResponse.redirect(new URL(getRoleHomePath(role), request.url));
    }
  }

  return NextResponse.redirect(new URL(redirectTo, request.url));
}
