"use client";

import { Button } from "@heroui/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { signIn } from "@/lib/auth-client";
import { handleAsync } from "@/lib/error-handler";

export const LoginView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginMode, setLoginMode] = useState<"passkey" | "password">("passkey");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Show error from URL params (e.g., from proxy redirect)
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "unauthorized") {
      setError("You must be logged in to access that page");
    }
  }, [searchParams]);

  const handlePasskeySignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.passkey({
        fetchOptions: {
          onSuccess: () => {
            router.push("/admin/dashboard");
          },
          onError: () => {
            setError("Authentication failed. Please try again.");
            setIsLoading(false);
          },
        },
      });

      if (!result) {
        setError("Authentication failed. Please try again.");
        setIsLoading(false);
      }
    } catch {
      setError("Authentication failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const [err] = await handleAsync(() =>
      signIn.email({
        email: formData.email,
        password: formData.password,
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">Admin Login</h1>
        <p className="mb-8 text-center text-gray-600">
          Sign in to access the admin panel
        </p>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loginMode === "passkey" ? (
          <>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onPress={handlePasskeySignIn}
              isPending={isLoading}
            >
              Sign in with Passkey
            </Button>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-300" />
              <span className="text-sm text-gray-500">or</span>
              <div className="h-px flex-1 bg-gray-300" />
            </div>

            <button
              type="button"
              onClick={() => setLoginMode("password")}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Sign in with email and password
            </button>
          </>
        ) : (
          <>
            <form onSubmit={handlePasswordSignIn} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isPending={isLoading}
              >
                Sign In
              </Button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-300" />
              <span className="text-sm text-gray-500">or</span>
              <div className="h-px flex-1 bg-gray-300" />
            </div>

            <button
              type="button"
              onClick={() => setLoginMode("passkey")}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Sign in with passkey instead
            </button>
          </>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            href="/admin/register"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};
