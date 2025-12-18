"use client";

import { useState } from "react";
import { verifyEmailCode, resendVerificationCode } from "@/lib/actions/verification.actions";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface EmailVerificationFormProps {
  email: string;
  onVerified: (data: { name: string; email: string; passwordHash: string }) => void;
}

export const EmailVerificationForm = ({
  email,
  onVerified,
}: EmailVerificationFormProps) => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleCodeChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (/^\d+$/.test(pastedData)) {
      const newCode = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
      setCode(newCode);

      // Focus the last filled input or the next empty one
      const nextEmptyIndex = newCode.findIndex(digit => !digit);
      const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
      document.getElementById(`code-${focusIndex}`)?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join("");

    if (verificationCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await verifyEmailCode({
        email,
        code: verificationCode,
      });

      if (result.success && result.verificationData) {
        onVerified(result.verificationData);
      } else {
        setError(result.message || "Invalid verification code");
      }
    } catch (err: any) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setResendMessage("");
    setError("");

    try {
      const result = await resendVerificationCode(email);

      if (result.success) {
        setResendMessage(result.message || "New code sent!");
        setCode(["", "", "", "", "", ""]);
        document.getElementById("code-0")?.focus();
      } else {
        setError(result.message || "Failed to resend code");
      }
    } catch (err: any) {
      setError(err.message || "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-700">
      {/* Full screen - Form centered */}
      <section className="w-full h-full flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-[600px] flex flex-col gap-5">
          {/* Logo */}
          <div className="flex justify-center flex-shrink-0">
            <Image
              src="/assets/icons/logo-full.png"
              height={200}
              width={200}
              alt="LifeLynk"
              className="h-8 w-auto"
            />
          </div>

          {/* Main Content Card */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl flex-shrink-0">
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-white">Verify Your Email</h1>
                <p className="text-white/80 text-sm md:text-base">
                  We've sent a 6-digit verification code to
                </p>
                <p className="text-white font-semibold text-base md:text-lg">{email}</p>
              </div>

              {/* Form */}
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="space-y-4">
                  <label className="text-white font-medium text-center block">Enter Verification Code</label>
                  <div className="flex gap-3 justify-center" onPaste={handlePaste}>
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        id={`code-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-14 h-14 text-center text-3xl font-bold rounded-lg border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/70 focus:border-white/50 transition-all"
                        disabled={isLoading}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-300 text-red-100 p-4 rounded-lg text-sm text-center">
                    {error}
                  </div>
                )}

                {resendMessage && (
                  <div className="bg-white/20 border border-white/40 text-white p-4 rounded-lg text-sm text-center">
                    {resendMessage}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || code.join("").length !== 6}
                  className="w-full bg-white hover:bg-white/90 text-indigo-700 font-semibold py-6 rounded-lg transition-all text-lg"
                >
                  {isLoading ? "Verifying..." : "Verify Email"}
                </Button>

                <div className="text-center space-y-3">
                  <p className="text-white/80 text-sm">Didn't receive the code?</p>
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResend}
                    disabled={isResending}
                    className="text-white font-semibold hover:underline p-0 h-auto text-base"
                  >
                    {isResending ? "Sending..." : "Resend Code"}
                  </Button>
                </div>
              </form>

              {/* Help text */}
              <p className="text-white/60 text-xs md:text-sm text-center pt-3 border-t border-white/10">
                Check your spam folder if you don't see the email. The code expires in 15 minutes.
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-white/70 text-sm text-center flex-shrink-0 mt-2">
            © 2025 LifeLynk
          </p>
        </div>
      </section>
    </div>
  );
};
