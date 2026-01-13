import { passkeyClient } from "@better-auth/passkey/client";
import { createAuthClient } from "better-auth/react";
import { formatError } from "./error-handler";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [passkeyClient()],
  fetchOptions: {
    onError: (context) => {
      // Format Better Auth errors consistently
      const formattedError = formatError(context.error);

      // Log errors in development
      if (process.env.NODE_ENV === "development") {
        console.error("Auth error:", formattedError);
      }

      // Re-throw formatted error so components can handle it
      throw formattedError;
    },
  },
});

export const { signIn, signUp, signOut, useSession, passkey } = authClient;
