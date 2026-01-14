import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export const proxy = async (req: NextRequest) => {
	const path = req.nextUrl.pathname;

	// Check if the path contains (protected) route group
	const isProtectedRoute = path.includes("/(protected)/") || /\/\(protected\)\//.test(path);

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
