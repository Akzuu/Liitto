"use client";

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider-client";
import { passkey } from "@/lib/auth-client";
import { handleAsync } from "@/lib/error-handler";

export const AuthenticatedView = () => {
	const router = useRouter();
	const { session } = useAuth();
	const user = session.user;
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

  const handleRegisterPasskey = async () => {
    setIsLoading(true);
    setError(null);

    const [err] = await handleAsync(() =>
      passkey.addPasskey({
        fetchOptions: {
          onSuccess: () => {
            alert("Passkey registered successfully!");
          },
        },
      }),
    );

    if (err) {
      setError(err.message);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">Authenticated</h1>
        <p className="mb-6 text-center text-gray-600">
          Signed in as <strong>{user.email}</strong>
        </p>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onPress={handleRegisterPasskey}
            isPending={isLoading}
          >
            Register New Passkey
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onPress={() => router.push("/admin/dashboard")}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
