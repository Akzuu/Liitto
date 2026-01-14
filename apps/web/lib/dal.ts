import "server-only";
import { headers } from "next/headers";
import { cache } from "react";
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

/**
 * Verify the user has admin role.
 * Returns the session if user is admin, null otherwise.
 */
export const verifyAdminSession = cache(async (): Promise<Session | null> => {
  const session = await verifySession();

  if (!session?.user) {
    return null;
  }

  // Check if user has admin role
  if (session.user.role !== "admin") {
    return null;
  }

  return session;
});
