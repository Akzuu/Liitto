"use client";

import { Button, Card, CardHeader, CardContent, Input } from "@heroui/react";
import { useState } from "react";

export default function HomePage() {
  const [fullName, setFullName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // For now, just a placeholder - you'll need to implement actual auth
    console.log("Login attempt:", { fullName, pin });
    setError("Authentication not yet implemented");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 to-blue-50">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="flex flex-col gap-2 items-center pb-6 pt-8">
          <h1 className="text-3xl font-bold text-center text-gray-900">
            Welcome to Our Wedding
          </h1>
          <p className="text-sm text-center text-gray-700">
            Please enter your details to view your invitation
          </p>
        </CardHeader>
        <CardContent className="gap-4 pb-8">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="fullName" className="text-sm font-medium text-gray-900">
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="pin" className="text-sm font-medium text-gray-900">
                4-Digit PIN
              </label>
              <Input
                id="pin"
                type="password"
                placeholder="Enter your PIN"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
            >
              View Invitation
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
