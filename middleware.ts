import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { supabaseAuthCookieOptions } from "@/lib/supabase/auth-config";

const protectedUserPaths = ["/my", "/record"];
const authPaths = ["/login", "/signup"];

function isProtectedUserPath(pathname: string) {
  return protectedUserPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isAuthPath(pathname: string) {
  return authPaths.includes(pathname);
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

  if (!user && isProtectedUserPath(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);

    const redirectResponse = NextResponse.redirect(loginUrl);
    cookiesToApply.forEach(({ name, value, options }) => redirectResponse.cookies.set(name, value, options));
    return redirectResponse;
  }

  if (user && isAuthPath(pathname)) {
    const nextPath = request.nextUrl.searchParams.get("next");
    const redirectPath = nextPath?.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/my";
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
