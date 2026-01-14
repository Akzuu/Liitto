"use client";

import { Button } from "@heroui/react";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider-client";
import { passkey } from "@/lib/auth-client";
import { handleAsync } from "@/lib/error-handler";
import { AdminLayout } from "../components/admin-layout";

const PasskeysPage = () => {
  const { session } = useAuth();
  const user = session.user;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAddPasskey = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const [err] = await handleAsync(() =>
      passkey.addPasskey({
        fetchOptions: {
          onSuccess: () => {
            setSuccess("Passkey registered successfully!");
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
    <AdminLayout title="Passkey Management">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold">Your Account</h2>
          <p className="mb-6 text-gray-600">
            Signed in as <strong>{user.email}</strong>
          </p>

          <div className="mb-8 border-t pt-6">
            <h3 className="mb-2 text-lg font-semibold">What are Passkeys?</h3>
            <p className="mb-4 text-sm text-gray-600">
              Passkeys are a more secure and convenient way to sign in. They use
              your device's biometric authentication (fingerprint, face
              recognition) or PIN to verify your identity without needing a
              password.
            </p>
            <ul className="mb-4 list-inside list-disc space-y-1 text-sm text-gray-600">
              <li>More secure than passwords</li>
              <li>Faster sign-in experience</li>
              <li>Works across your devices</li>
              <li>Protected by your device's security</li>
            </ul>
          </div>

          {error && (
            <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded bg-green-50 p-3 text-sm text-green-600">
              {success}
            </div>
          )}

          <div className="border-t pt-6">
            <h3 className="mb-4 text-lg font-semibold">Register a Passkey</h3>
            <p className="mb-4 text-sm text-gray-600">
              Add a passkey to this account to enable faster, password-free
              sign-ins.
            </p>
            <Button
              variant="primary"
              size="lg"
              onPress={handleAddPasskey}
              isPending={isLoading}
            >
              Add New Passkey
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PasskeysPage;
