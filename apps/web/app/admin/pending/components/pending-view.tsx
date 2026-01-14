"use client";

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";

type PendingViewProps = {
  email: string;
};

export const PendingView = ({ email }: PendingViewProps) => {
  const router = useRouter();

  const handleSignOut = async () => {
    const { signOut } = await import("@/lib/auth-client");
    await signOut();
    router.push("/admin");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <svg
              className="h-8 w-8 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <title>Pending approval</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold">Account Pending Approval</h1>
          <p className="text-gray-600">
            Your account has been created successfully!
          </p>
        </div>

        <div className="mb-8 rounded-lg bg-blue-50 p-6">
          <p className="mb-4 text-sm text-gray-700">
            Your account is currently waiting for approval from an existing
            administrator. You will be able to access the admin panel once your
            account has been approved.
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <strong>Your email:</strong> {email}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className="font-medium text-yellow-600">
                Pending Approval
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h2 className="mb-2 font-semibold text-gray-800">
              What happens next?
            </h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>An administrator will review your registration</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>You'll receive access once approved</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Check back later or contact an admin for updates</span>
              </li>
            </ul>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onPress={() => router.push("/admin/setup-passkey")}
          >
            Setup Passkey While Waiting
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onPress={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};
