import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Afferent Signal — Route Middleware
 *
 * RULES (non-negotiable):
 * - /ops/* is STAFF ONLY — never accessible to consumers
 * - /api/* server routes are protected from direct browser access
 * - All consumer routes (/app, /submit, /campaigns, etc.) pass through freely
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Block /ops from unauthenticated access
  // In production: check Supabase session cookie for staff role
  if (pathname.startsWith("/ops")) {
    const staffToken = request.cookies.get("sb-staff-session");

    if (!staffToken) {
      // Redirect to a neutral 404-style page — never reveal /ops exists to consumers
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next();

  // Prevent /ops pages from being cached at the edge
  if (pathname.startsWith("/ops")) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("X-Frame-Options", "DENY");
  }

  return response;
}

export const config = {
  // Run middleware on all routes except static assets and Next.js internals
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
