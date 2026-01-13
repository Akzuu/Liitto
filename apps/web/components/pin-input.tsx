"use client";

import { Button, CardContent } from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

export const PinInput = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState(["", "", "", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Populate code from URL parameter
  useEffect(() => {
    const pinFromUrl = searchParams.get("pin");
    if (!pinFromUrl) return;

    // Remove any hyphens or spaces and validate format (8 alphanumeric characters)
    const cleanedPin = pinFromUrl.replace(/[-\s]/g, "").toUpperCase();
    if (/^[A-Z0-9]{8}$/.test(cleanedPin)) {
      const newCode = [
        cleanedPin[0] ?? "",
        cleanedPin[1] ?? "",
        cleanedPin[2] ?? "",
        cleanedPin[3] ?? "",
        cleanedPin[4] ?? "",
        cleanedPin[5] ?? "",
        cleanedPin[6] ?? "",
        cleanedPin[7] ?? "",
      ];
      setCode(newCode);
      // Focus the last input after populating
      setTimeout(() => {
        const lastInput = inputRefs[7]?.current;
        if (lastInput) {
          lastInput.focus();
        }
      }, 0);
    }
  }, [searchParams, inputRefs[7]?.current]);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow alphanumeric characters (A-Z, 0-9)
    if (value && !/^[a-zA-Z0-9]$/.test(value)) return;
    value = value.toUpperCase();

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 7) {
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
      .replace(/[-\s]/g, "")
      .toUpperCase()
      .slice(0, 8);

    if (/^[A-Z0-9]{8}$/.test(pastedData)) {
      const newCode = [
        pastedData[0] ?? "",
        pastedData[1] ?? "",
        pastedData[2] ?? "",
        pastedData[3] ?? "",
        pastedData[4] ?? "",
        pastedData[5] ?? "",
        pastedData[6] ?? "",
        pastedData[7] ?? "",
      ];
      setCode(newCode);
      // Focus the last input
      const lastInput = inputRefs[7]?.current;
      if (lastInput) {
        lastInput.focus();
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const fullCode = code.join("");
    if (fullCode.length !== 8) {
      setError("Please enter the complete code");
      return;
    }

    const formattedCode = `${code[0]}${code[1]}${code[2]}${code[3]}-${code[4]}${code[5]}${code[6]}${code[7]}`;

    // For now, always succeed and navigate to invitation page
    console.log("Login attempt:", { code: formattedCode });

    // Store the code in sessionStorage for the invitation page
    sessionStorage.setItem("invitationCode", formattedCode);

    // Navigate to invitation page
    router.push("/invitation");
  };

  return (
    <CardContent className="gap-4 pb-8">
      <form onSubmit={handleLogin} className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 justify-center items-center">
            <input
              ref={inputRefs[0]}
              type="text"
              maxLength={1}
              value={code[0]}
              onChange={(e) => handleCodeChange(0, e.target.value)}
              onKeyDown={(e) => handleKeyDown(0, e)}
              onPaste={handlePaste}
              className="w-12 h-12 text-center text-xl font-semibold text-gray-900 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all uppercase"
              required
              aria-label="Code character 1"
            />
            <input
              ref={inputRefs[1]}
              type="text"
              maxLength={1}
              value={code[1]}
              onChange={(e) => handleCodeChange(1, e.target.value)}
              onKeyDown={(e) => handleKeyDown(1, e)}
              className="w-12 h-12 text-center text-xl font-semibold text-gray-900 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all uppercase"
              required
              aria-label="Code character 2"
            />
            <input
              ref={inputRefs[2]}
              type="text"
              maxLength={1}
              value={code[2]}
              onChange={(e) => handleCodeChange(2, e.target.value)}
              onKeyDown={(e) => handleKeyDown(2, e)}
              className="w-12 h-12 text-center text-xl font-semibold text-gray-900 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all uppercase"
              required
              aria-label="Code character 3"
            />
            <input
              ref={inputRefs[3]}
              type="text"
              maxLength={1}
              value={code[3]}
              onChange={(e) => handleCodeChange(3, e.target.value)}
              onKeyDown={(e) => handleKeyDown(3, e)}
              className="w-12 h-12 text-center text-xl font-semibold text-gray-900 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all uppercase"
              required
              aria-label="Code character 4"
            />
            <span className="text-xl font-bold text-gray-400 mx-1">-</span>
            <input
              ref={inputRefs[4]}
              type="text"
              maxLength={1}
              value={code[4]}
              onChange={(e) => handleCodeChange(4, e.target.value)}
              onKeyDown={(e) => handleKeyDown(4, e)}
              className="w-12 h-12 text-center text-xl font-semibold text-gray-900 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all uppercase"
              required
              aria-label="Code character 5"
            />
            <input
              ref={inputRefs[5]}
              type="text"
              maxLength={1}
              value={code[5]}
              onChange={(e) => handleCodeChange(5, e.target.value)}
              onKeyDown={(e) => handleKeyDown(5, e)}
              className="w-12 h-12 text-center text-xl font-semibold text-gray-900 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all uppercase"
              required
              aria-label="Code character 6"
            />
            <input
              ref={inputRefs[6]}
              type="text"
              maxLength={1}
              value={code[6]}
              onChange={(e) => handleCodeChange(6, e.target.value)}
              onKeyDown={(e) => handleKeyDown(6, e)}
              className="w-12 h-12 text-center text-xl font-semibold text-gray-900 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all uppercase"
              required
              aria-label="Code character 7"
            />
            <input
              ref={inputRefs[7]}
              type="text"
              maxLength={1}
              value={code[7]}
              onChange={(e) => handleCodeChange(7, e.target.value)}
              onKeyDown={(e) => handleKeyDown(7, e)}
              className="w-12 h-12 text-center text-xl font-semibold text-gray-900 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all uppercase"
              required
              aria-label="Code character 8"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <Button type="submit" variant="primary" size="lg" className="w-full">
          Jatka
        </Button>
      </form>
    </CardContent>
  );
};
