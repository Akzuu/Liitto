"use client";

import { Button, Disclosure } from "@heroui/react";
import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { AlertMessage } from "@/components/alert-message";
import { passkey } from "@/lib/auth-client";
import { AdminLayout } from "../../components/admin-layout";
import { deletePasskey, type PasskeyListItem } from "../lib/passkey-actions";

type PasskeysContentProps = {
  email: string;
  passkeys: PasskeyListItem[];
};

export const PasskeysContent = ({
  email,
  passkeys: initialPasskeys,
}: PasskeysContentProps) => {
  const [userPasskey, setUserPasskey] = useState<PasskeyListItem | null>(
    initialPasskeys[0] ?? null,
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAddPasskey = () => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await passkey.addPasskey();

      if (result.data) {
        setSuccess("Passkey added successfully!");
        // Convert Passkey to PasskeyListItem
        setUserPasskey({
          id: result.data.id,
          name: result.data.name ?? null,
          createdAt: result.data.createdAt
            ? new Date(result.data.createdAt)
            : null,
        });
      } else {
        setError("Failed to add passkey");
      }
    });
  };

  const handleDeletePasskey = () => {
    if (!userPasskey) return;

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await deletePasskey(userPasskey.id);

      if (result.success) {
        setSuccess("Passkey removed successfully!");
        setUserPasskey(null);
      } else {
        setError("Failed to remove passkey");
      }
    });
  };

  return (
    <AdminLayout title="Passkey Management">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold">Your Account</h2>
          <p className="mb-6 text-gray-600">
            Signed in as <strong>{email}</strong>
          </p>

          <div className="mb-8 border-t pt-6">
            <Disclosure>
              <Disclosure.Heading>
                <Disclosure.Trigger className="flex w-full items-center justify-between text-left">
                  <h3 className="text-lg font-semibold">What are Passkeys?</h3>
                  <Disclosure.Indicator />
                </Disclosure.Trigger>
              </Disclosure.Heading>
              <Disclosure.Content>
                <div className="mt-4">
                  <p className="mb-4 text-sm text-gray-600">
                    Passkeys are a more secure and convenient way to sign in.
                    They use your device's biometric authentication
                    (fingerprint, face recognition) or PIN to verify your
                    identity without needing a password.
                  </p>
                  <ul className="mb-4 list-inside list-disc space-y-1 text-sm text-gray-600">
                    <li>More secure than passwords</li>
                    <li>Faster sign-in experience</li>
                    <li>Works across your devices</li>
                    <li>Protected by your device's security</li>
                  </ul>
                </div>
              </Disclosure.Content>
            </Disclosure>
          </div>

          {error && <AlertMessage variant="error">{error}</AlertMessage>}

          {success && <AlertMessage variant="success">{success}</AlertMessage>}

          <div className="mb-8 border-t pt-6">
            <h3 className="mb-4 text-lg font-semibold">Your Passkey</h3>
            {!userPasskey ? (
              <p className="text-sm text-gray-600">
                No passkey registered yet. Add one below to enable faster
                sign-ins.
              </p>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex-1">
                  <p className="font-medium">Passkey</p>
                  <p className="text-sm text-gray-600">
                    Added{" "}
                    {userPasskey.createdAt
                      ? new Date(userPasskey.createdAt).toLocaleDateString()
                      : "Unknown date"}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={handleDeletePasskey}
                  isPending={isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            )}
          </div>

          {!userPasskey && (
            <div className="border-t pt-6">
              <h3 className="mb-4 text-lg font-semibold">Add Passkey</h3>
              <p className="mb-4 text-sm text-gray-600">
                Add a passkey to this account to enable faster, password-free
                sign-ins.
              </p>
              <Button
                variant="primary"
                size="lg"
                onPress={handleAddPasskey}
                isPending={isPending}
              >
                Add Passkey
              </Button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
