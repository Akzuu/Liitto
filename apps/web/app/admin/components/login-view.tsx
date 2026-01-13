"use client";

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { handleAsync } from "@/lib/error-handler";

export const LoginView = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasskeySignIn = async () => {
    setIsLoading(true);
    setError(null);

    const [err] = await handleAsync(() =>
      signIn.passkey({
        fetchOptions: {
          onSuccess: () => {
            router.push("/admin/dashboard");
          },
        },
      })
    );

    if (err) {
      setError(err.message);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">Admin Login</h1>
        <p className="mb-8 text-center text-gray-600">
          Sign in with your passkey to access the admin panel
        </p>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onPress={handlePasskeySignIn}
          isPending={isLoading}
        >
          Sign in with Passkey
        </Button>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have a passkey? You need to create an admin account first with
          email and password, then register a passkey.
        </p>
      </div>
    </div>
  );
};
