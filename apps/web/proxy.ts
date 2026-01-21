import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getSessionCookieName,
  validateSessionToken,
} from "./lib/invitation-session";

/**
 * Validate invitation session for /invitation routes
 * Returns NextResponse if validation fails, null if valid
 */
const validateInvitationSession = async (
  req: NextRequest,
): Promise<NextResponse | null> => {
  const token = req.cookies.get(getSessionCookieName())?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const session = await validateSessionToken(token);

  if (!session) {
    const response = NextResponse.redirect(new URL("/", req.url));
    response.cookies.delete(getSessionCookieName());
    return response;
  }

  return null; // Valid session, continue
};

/**
 * Routes that require admin role
 * Note: /admin/pending is accessible to pending users (not in this list)
 */
const ADMIN_ONLY_ROUTES = [
  "/admin/dashboard",
  "/admin/users",
  "/admin/passkeys",
  "/admin/invitations",
  "/admin/rsvp",
  "/admin/guests",
  "/admin/settings",
];

/**
 * Validate admin authentication for /admin routes
 * Returns NextResponse if validation fails, null if valid
 */
const validateAdminAuth = async (
  req: NextRequest,
  path: string,
): Promise<NextResponse | null> => {
  const isAdminOnlyRoute = ADMIN_ONLY_ROUTES.some((route) =>
    path.startsWith(route),
  );

  if (!isAdminOnlyRoute) {
    return null; // Not an admin-only route, continue
  }

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user) {
    const loginUrl = new URL("/admin", req.url);
    loginUrl.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(loginUrl);
  }

  if (session.user.role !== "admin") {
    // Redirect pending users to pending approval page
    if (session.user.role === "pending") {
      return NextResponse.redirect(new URL("/admin/pending", req.url));
    }

    // Other roles are unauthorized
    const loginUrl = new URL("/admin", req.url);
    loginUrl.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(loginUrl);
  }

  return null; // Valid admin session, continue
};

/**
 * Main proxy middleware - routes requests to appropriate validators
 */
export const proxy = async (req: NextRequest) => {
  const path = req.nextUrl.pathname;

  // Handle invitation routes
  if (path.startsWith("/invitation")) {
    try {
      const response = await validateInvitationSession(req);
      if (response) {
        return response;
      }
      return NextResponse.next();
    } catch (error) {
      console.error("Invitation session validation error:", error);
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Handle admin routes
  if (path.startsWith("/admin")) {
    const response = await validateAdminAuth(req, path);
    if (response) {
      return response;
    }
    return NextResponse.next();
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
