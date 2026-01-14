"use client";

import { createContext, type ReactNode, useContext } from "react";
import type { Session } from "@/auth";

type AuthContextType = {
  session: Session;
};

const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderClientProps = {
  children: ReactNode;
  session: Session;
};

/**
 * Client component that provides auth context to child components.
 * Must receive session from Server Component parent.
 */
export const AuthProviderClient = ({
  children,
  session,
}: AuthProviderClientProps) => {
  return (
    <AuthContext.Provider value={{ session }}>{children}</AuthContext.Provider>
  );
};

/**
 * Hook to access auth context in Client Components.
 * Throws error if used outside AuthProvider.
 *
 * @example
 * const { session } = useAuth();
 * const user = session.user;
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
