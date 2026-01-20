"use client";

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { passkey, useSession } from "@/lib/auth-client";
import { handleAsync } from "@/lib/error-handler";

const SetupPasskeyPage = () => {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRedirectPath = () => {
    if (session?.user.role === "admin") {
      return "/admin/dashboard";
    }
    return "/admin/pending";
  };

  const handleSetupPasskey = async () => {
    setIsLoading(true);
    setError(null);

    const [err] = await handleAsync(() =>
      passkey.addPasskey({
        fetchOptions: {
          onSuccess: () => {
            router.push(getRedirectPath());
          },
        },
      })
    );

    if (err) {
      setError(err.message);
    }

    setIsLoading(false);
  };

  const handleSkip = () => {
    router.push(getRedirectPath());
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-bold">Secure Your Account</h1>
          <p className="text-gray-600">
            Set up a passkey for faster, safer login
          </p>
        </div>

        <div className="mb-8 space-y-4 rounded-lg bg-blue-50 p-6">
          <h2 className="font-semibold text-blue-900">Why use a passkey?</h2>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="mt-0.5">🔒</span>
              <span>
                <strong>More secure</strong> - Protected by your device's
                biometrics
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">⚡</span>
              <span>
                <strong>Faster login</strong> - No password to type or remember
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">🛡️</span>
              <span>
                <strong>Phishing-proof</strong> - Can't be stolen or guessed
              </span>
            </li>
          </ul>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onPress={handleSetupPasskey}
            isPending={isLoading}
          >
            Set Up Passkey
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onPress={handleSkip}
            isDisabled={isLoading}
          >
            Skip for Now
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          You can always set up a passkey later from your account settings
        </p>
      </div>
    </div>
  );
};

export default SetupPasskeyPage;
