import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { auth, type Session } from "@/auth";

/**
 * Data Access Layer (DAL) for authentication.
 * Verifies the user session and provides secure access to session data.
 * Uses React cache to memoize the result during a render pass.
 */
export const verifySession = cache(async (): Promise<Session | null> => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return null;
	}

	return session;
});

/**
 * Get the current authenticated user from the session.
 * Returns null if no valid session exists.
 */
export const getUser = cache(async () => {
	const session = await verifySession();

	if (!session?.user) {
		return null;
	}

	return session.user;
});
