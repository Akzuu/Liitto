import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const proxy = async (req: NextRequest) => {
  const path = req.nextUrl.pathname;

  // Check if this is a protected admin route
  // Protected routes: /admin/dashboard, /admin/users, /admin/passkeys, etc.
  // Non-protected: /admin (login), /admin/register, /admin/setup-passkey, /admin/pending
  const protectedRoutes = [
    "/admin/dashboard",
    "/admin/users",
    "/admin/passkeys",
    "/admin/invitations",
    "/admin/rsvps",
    "/admin/guests",
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get session from Better Auth
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  // Redirect to login if not authenticated
  if (!session?.user) {
    const loginUrl = new URL("/admin", req.url);
    loginUrl.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(loginUrl);
  }

  // Check if user has admin role
  if (session.user.role !== "admin") {
    // Redirect pending users to pending approval page
    if (session.user.role === "pending") {
      const pendingUrl = new URL("/admin/pending", req.url);
      return NextResponse.redirect(pendingUrl);
    }

    // Other roles (or no role) are unauthorized
    const loginUrl = new URL("/admin", req.url);
    loginUrl.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(loginUrl);
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
