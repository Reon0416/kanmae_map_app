import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { ROLE_HOME_PATH, USER_ROLE, type UserRole } from "@/features/auth/roles";

const userRoles = new Set<string>(Object.values(USER_ROLE));

export function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export function hashEmail(email: string) {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

export function getAuthCallbackUrl(request: NextRequest, redirectTo: string) {
  const callbackUrl = new URL("/auth/callback", request.url);
  callbackUrl.searchParams.set("next", redirectTo);
  return callbackUrl.toString();
}

export function getRoleHomePath(role: UserRole) {
  if (role === USER_ROLE.USER) {
    return "/";
  }

  return ROLE_HOME_PATH[role];
}

export function getPostAuthRedirectPath(role: UserRole, redirectTo: string) {
  if (role !== USER_ROLE.USER) {
    return getRoleHomePath(role);
  }

  return redirectTo;
}

export async function logAuthEvent(
  supabase: SupabaseClient,
  input: {
    eventType: "signup" | "login" | "email_callback";
    status: string;
    emailHash?: string;
    userId?: string;
    role?: UserRole;
    errorCode?: string;
    errorMessage?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }
) {
  await supabase.rpc("log_auth_event", {
    p_event_type: input.eventType,
    p_status: input.status,
    p_email_hash: input.emailHash ?? null,
    p_user_id: input.userId ?? null,
    p_role: input.role ?? null,
    p_error_code: input.errorCode ?? null,
    p_error_message: input.errorMessage ?? null,
    p_ip_address: input.ipAddress ?? null,
    p_user_agent: input.userAgent ?? null,
    p_metadata: input.metadata ?? {}
  });
}

export async function ensureProfileAndGetRole(supabase: SupabaseClient, user: User) {
  return ensureProfileAndGetRoleWithToken(supabase, user);
}

export async function ensureProfileAndGetRoleWithToken(supabase: SupabaseClient, user: User, accessToken?: string) {
  const roleClient =
    accessToken && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          },
          global: {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        })
      : supabase;

  const { data: profile } = await roleClient.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const directRole = profile?.role;

  if (userRoles.has(directRole)) {
    return directRole as UserRole;
  }

  const { data: profileRows, error } = await roleClient.rpc("ensure_current_profile", {
    p_display_name: user.user_metadata?.display_name ?? null
  });

  if (error || !profileRows?.[0]) {
    return USER_ROLE.USER;
  }

  const role = profileRows[0].role;
  return userRoles.has(role) ? (role as UserRole) : USER_ROLE.USER;
}
