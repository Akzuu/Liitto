"use client";

import { Button, Card, CardHeader, Input, Label } from "@heroui/react";
import { useState } from "react";

export default function LandingPage() {
  const [fullName, setFullName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          pin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Redirect to invitation page on success
      window.location.href = "/invitation";
    } catch (err) {
      console.log(err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="flex flex-col gap-2 items-center pb-6 pt-8">
          <h1 className="text-3xl font-bold text-center">
            Welcome to Our Wedding
          </h1>
          <p className="text-sm text-center">
            Please enter your details to view your invitation
          </p>
        </CardHeader>
        <Card className="gap-4 pb-8">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
              id="input-fullname"
              placeholder="Enter your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              aria-label="Moro"
              required
            />
            <Input
              placeholder="Enter your PIN"
              type="password"
              value={pin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                setPin(value);
              }}
              maxLength={4}
            />
            {error && (
              <div className="text-sm text-danger text-center bg-danger-50 p-2 rounded-lg">
                {error}
              </div>
            )}
            <Button
              type="submit"
              size="lg"
              className="mt-2"
              isDisabled={!fullName || pin.length !== 4}
            >
              View Invitation
            </Button>
          </form>
        </Card>
      </Card>
    </main>
  );
}
