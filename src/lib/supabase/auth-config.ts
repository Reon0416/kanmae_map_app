import type { CookieOptionsWithName } from "@supabase/ssr";

export const SUPABASE_AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

export const supabaseAuthCookieOptions: CookieOptionsWithName = {
  maxAge: SUPABASE_AUTH_COOKIE_MAX_AGE_SECONDS,
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production"
};
