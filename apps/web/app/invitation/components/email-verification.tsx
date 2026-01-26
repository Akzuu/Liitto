"use client";

import { Button, Card, CardContent, CardHeader } from "@heroui/react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

type EmailVerificationProps = {
  onVerified: () => void;
  onLogout?: () => void;
};

const CODE_INPUTS = [
  { id: "code-input-0", index: 0 },
  { id: "code-input-1", index: 1 },
  { id: "code-input-2", index: 2 },
  { id: "code-input-3", index: 3 },
  { id: "code-input-4", index: 4 },
  { id: "code-input-5", index: 5 },
];

export const EmailVerification = ({
  onVerified,
  onLogout,
}: EmailVerificationProps) => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isCheckingCooldown, setIsCheckingCooldown] = useState(true);
  const [cooldownEndsAt, setCooldownEndsAt] = useState<Date | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Countdown timer for cooldown
  useEffect(() => {
    if (!cooldownEndsAt) return;

    // Calculate immediately to prevent flash
    const calculateRemaining = () => {
      const remaining = Math.ceil(
        (cooldownEndsAt.getTime() - Date.now()) / 1000,
      );
      return remaining > 0 ? remaining : 0;
    };

    // Set initial value immediately
    setCooldownSeconds(calculateRemaining());

    // Then update every 100ms
    const interval = setInterval(() => {
      const remaining = calculateRemaining();

      if (remaining <= 0) {
        setCooldownEndsAt(null);
        setCooldownSeconds(0);
      } else {
        setCooldownSeconds(remaining);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [cooldownEndsAt]);

  // Check if cooldown is active on mount
  useEffect(() => {
    const checkCooldown = async () => {
      setIsCheckingCooldown(true);
      try {
        const response = await fetch("/api/invitation/send-verification");
        if (response.ok) {
          const data = await response.json();
          if (data.cooldownActive && data.cooldownEndsAt) {
            setCooldownEndsAt(new Date(data.cooldownEndsAt));
          }
        }
      } catch {
        // Silently fail - cooldown check is not critical
      } finally {
        setIsCheckingCooldown(false);
      }
    };

    checkCooldown();
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = inputRefs[index + 1]?.current;
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = inputRefs[index - 1]?.current;
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (/^\d{6}$/.test(pastedData)) {
      const newCode = [
        pastedData[0] ?? "",
        pastedData[1] ?? "",
        pastedData[2] ?? "",
        pastedData[3] ?? "",
        pastedData[4] ?? "",
        pastedData[5] ?? "",
      ];
      setCode(newCode);
      // Focus the last input
      const lastInput = inputRefs[5]?.current;
      if (lastInput) {
        lastInput.focus();
      }
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch("/api/invitation/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: fullCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid verification code");
        setIsVerifying(false);
        return;
      }

      // Verification successful
      onVerified();
    } catch (error) {
      console.error("Error verifying code:", error);
      setError("An error occurred. Please try again.");
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError("");
    try {
      const response = await fetch("/api/invitation/send-verification", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        // Handle cooldown or rate limit error
        if (data.cooldownEndsAt) {
          setCooldownEndsAt(new Date(data.cooldownEndsAt));
          setError(data.error);
          return;
        }
        if (data.error) {
          setError(data.error);
          return;
        }
        setError("Failed to resend code. Please try again.");
        return;
      }

      // Success - get cooldown from response
      const data = await response.json();
      if (data.cooldownEndsAt) {
        setCooldownEndsAt(new Date(data.cooldownEndsAt));
      }

      // Clear the code inputs
      setCode(["", "", "", "", "", ""]);
      // Focus first input
      const firstInput = inputRefs[0]?.current;
      if (firstInput) {
        firstInput.focus();
      }
    } catch {
      setError("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const getResendButtonText = () => {
    if (isCheckingCooldown) return "Tarkistetaan...";
    if (isResending) return "Lähetetään...";
    if (cooldownSeconds > 0)
      return `Lähetä koodi uudelleen (${cooldownSeconds} s)`;
    return "Lähetä koodi uudelleen";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 to-blue-50">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="flex flex-col gap-2 items-center pb-6 pt-8">
          <h1 className="text-2xl font-bold text-center text-gray-900">
            Vahvista sähköpostiosoitteesi
          </h1>
          <p className="text-sm text-center text-gray-700">
            Olemme lähettäneet 6-numeroisen vahvistuskoodin.
          </p>
        </CardHeader>
        <CardContent className="gap-4 pb-8">
          <form onSubmit={handleVerify} className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 justify-center items-center">
                {CODE_INPUTS.map(({ id, index }) => (
                  <input
                    key={id}
                    ref={inputRefs[index]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={code[index]}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-xl font-semibold text-gray-900 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                    required
                    aria-label={`Verification code digit ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isPending={isVerifying}
            >
              {isVerifying ? "Vahvistetaan..." : "Vahvista"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="md"
              className="w-full"
              onPress={handleResend}
              isPending={isCheckingCooldown || isResending}
              isDisabled={
                isCheckingCooldown || isResending || cooldownSeconds > 0
              }
            >
              {getResendButtonText()}
            </Button>

            {onLogout && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full mt-2"
                onPress={onLogout}
              >
                Kirjaudu ulos
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
