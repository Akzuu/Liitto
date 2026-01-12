"use client";

import { Button, CardContent } from "@heroui/react";
import { type KeyboardEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export const PinInput = () => {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleCodeChange = (index: number, value: string) => {
    // First two inputs: only allow letters
    if (index < 2) {
      if (value && !/^[a-zA-Z]$/.test(value)) return;
      value = value.toUpperCase();
    } else {
      // Last four inputs: only allow numbers
      if (value && !/^\d$/.test(value)) return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 6) {
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
      .slice(0, 7);

    if (/^[a-zA-Z]{2}\d{5}$/.test(pastedData)) {
      const newCode = [...code];
      for (let i = 0; i < pastedData.length; i++) {
        newCode[i] =
          i < 2 ? (pastedData[i]?.toUpperCase() ?? "") : (pastedData[i] ?? "");
      }
      setCode(newCode);
      // Focus the last input
      const lastInput = inputRefs[6]?.current;
      if (lastInput) {
        lastInput.focus();
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const fullCode = code.join("");
    if (fullCode.length !== 7) {
      setError("Please enter the complete code");
      return;
    }

    const formattedCode = `${code[0]}${code[1]}-${code[2]}${code[3]}${code[4]}${code[5]}${code[6]}`;
    
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
              className="w-14 h-14 text-center text-2xl font-semibold text-gray-900 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all uppercase"
              required
              aria-label="Code letter 1"
            />
            <input
              ref={inputRefs[1]}
              type="text"
              maxLength={1}
              value={code[1]}
              onChange={(e) => handleCodeChange(1, e.target.value)}
              onKeyDown={(e) => handleKeyDown(1, e)}
              className="w-14 h-14 text-center text-2xl font-semibold text-gray-900 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all uppercase"
              required
              aria-label="Code letter 2"
            />
            <span className="text-2xl font-bold text-gray-400 mx-1">-</span>
            <input
              ref={inputRefs[2]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={code[2]}
              onChange={(e) => handleCodeChange(2, e.target.value)}
              onKeyDown={(e) => handleKeyDown(2, e)}
              className="w-14 h-14 text-center text-2xl font-semibold text-gray-900 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
              required
              aria-label="Code digit 1"
            />
            <input
              ref={inputRefs[3]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={code[3]}
              onChange={(e) => handleCodeChange(3, e.target.value)}
              onKeyDown={(e) => handleKeyDown(3, e)}
              className="w-14 h-14 text-center text-2xl font-semibold text-gray-900 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
              required
              aria-label="Code digit 2"
            />
            <input
              ref={inputRefs[4]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={code[4]}
              onChange={(e) => handleCodeChange(4, e.target.value)}
              onKeyDown={(e) => handleKeyDown(4, e)}
              className="w-14 h-14 text-center text-2xl font-semibold text-gray-900 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
              required
              aria-label="Code digit 3"
            />
            <input
              ref={inputRefs[5]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={code[5]}
              onChange={(e) => handleCodeChange(5, e.target.value)}
              onKeyDown={(e) => handleKeyDown(5, e)}
              className="w-14 h-14 text-center text-2xl font-semibold text-gray-900 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
              required
              aria-label="Code digit 4"
            />
            <input
              ref={inputRefs[6]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={code[6]}
              onChange={(e) => handleCodeChange(6, e.target.value)}
              onKeyDown={(e) => handleKeyDown(6, e)}
              className="w-14 h-14 text-center text-2xl font-semibold text-gray-900 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
              required
              aria-label="Code digit 5"
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
