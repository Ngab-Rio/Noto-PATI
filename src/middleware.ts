import { type NextRequest, NextResponse } from "next/server";

import { createMiddlewareClient } from "@/lib/supabase/middleware";

const PROTECTED_PREFIXES = ["/admin", "/profile", "/my-reports"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // Check if any Supabase session cookies exist
  const hasAuthCookie = request.cookies
    .getAll()
    .some(
      (cookie) =>
        cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token")
    );

  // Fast-path: if public page and no auth cookie, pass through immediately (0 ms overhead)
  if (!isProtectedRoute && !hasAuthCookie) {
    return NextResponse.next({ request });
  }

  const { supabase, response } = createMiddlewareClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (pathname.startsWith("/admin") && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    (pathname.startsWith("/profile") || pathname.startsWith("/my-reports")) &&
    !user
  ) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/reports/map|api/location/reverse-geocode|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};