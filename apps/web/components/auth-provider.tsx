import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { verifySession } from "@/lib/dal";
import { AuthProviderClient } from "./auth-provider-client";

type AuthProviderProps = {
  children: ReactNode;
};

/**
 * Server Component that fetches session and provides it to Client Components.
 * Redirects to /admin if no valid session exists.
 *
 * This should be used in (protected) layouts to ensure all child components
 * have access to the authenticated session via useAuth() hook.
 */
export const AuthProvider = async ({ children }: AuthProviderProps) => {
  const session = await verifySession();

  if (!session) {
    redirect("/admin?error=unauthorized");
  }

  return <AuthProviderClient session={session}>{children}</AuthProviderClient>;
};
