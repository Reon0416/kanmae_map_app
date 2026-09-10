import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { supabaseAuthCookieOptions } from "@/lib/supabase/auth-config";

const protectedUserPaths = ["/my", "/record"];
const protectedStorePaths = ["/store-admin"];
const protectedAdminPaths = ["/admin"];
const authPaths = ["/login", "/signup"];

const roleHomePaths = {
  user: "/",
  store: "/store-admin",
  admin: "/admin"
} as const;

function matchesAnyPath(pathname: string, paths: string[]) {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function getRequiredRole(pathname: string) {
  if (matchesAnyPath(pathname, protectedAdminPaths)) return "admin";
  if (matchesAnyPath(pathname, protectedStorePaths)) return "store";
  if (matchesAnyPath(pathname, protectedUserPaths)) return "user";
  return null;
}

function isAuthPath(pathname: string) {
  return authPaths.includes(pathname);
}

function isValidRole(role: string | null | undefined): role is keyof typeof roleHomePaths {
  return role === "user" || role === "store" || role === "admin";
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  let cookiesToApply: { name: string; value: string; options: CookieOptions }[] = [];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: supabaseAuthCookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToApply = cookiesToSet;
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const requiredRole = getRequiredRole(pathname);

  if (!user && requiredRole) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);

    const redirectResponse = NextResponse.redirect(loginUrl);
    cookiesToApply.forEach(({ name, value, options }) => redirectResponse.cookies.set(name, value, options));
    return redirectResponse;
  }

  let role: keyof typeof roleHomePaths = "user";

  if (user && (requiredRole || isAuthPath(pathname))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    role = isValidRole(profile?.role) ? profile.role : "user";
  }

  if (user && requiredRole && role !== requiredRole) {
    const redirectResponse = NextResponse.redirect(new URL(roleHomePaths[role], request.url));
    cookiesToApply.forEach(({ name, value, options }) => redirectResponse.cookies.set(name, value, options));
    return redirectResponse;
  }

  if (user && isAuthPath(pathname)) {
    const nextPath = request.nextUrl.searchParams.get("next");
    const redirectPath =
      role === "user" && nextPath?.startsWith("/") && !nextPath.startsWith("//") ? nextPath : roleHomePaths[role];
    const redirectUrl = new URL(redirectPath, request.url);

    const redirectResponse = NextResponse.redirect(redirectUrl);
    cookiesToApply.forEach(({ name, value, options }) => redirectResponse.cookies.set(name, value, options));
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
