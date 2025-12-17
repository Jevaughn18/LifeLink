"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
    <div className="flex h-screen max-h-screen">
      <section className="remove-scrollbar container">
        <div className="sub-container max-w-[860px] flex-1 flex-col py-10">
          <Image
            src="/assets/icons/logo-full.svg"
            height={1000}
            width={1000}
            alt="patient"
            className="mb-12 h-10 w-fit"
          />

          <div className="space-y-6">
            <div className="mb-9 space-y-1">
              <h1 className="header">Verify Your Email 📧</h1>
              <p className="text-dark-700">
                We've sent a 6-digit verification code to{" "}
                <strong className="text-green-500">{email}</strong>
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <label className="text-14-medium">Enter Verification Code</label>
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
                      className="shad-input w-14 h-14 text-center text-2xl font-bold"
                      disabled={isLoading}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {resendMessage && (
                <div className="bg-green-500/10 border border-green-500 text-green-500 p-3 rounded-md text-sm">
                  {resendMessage}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || code.join("").length !== 6}
                className="shad-primary-btn w-full"
              >
                {isLoading ? "Verifying..." : "Verify Email"}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-dark-700 text-sm">Didn't receive the code?</p>
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-green-500"
                >
                  {isResending ? "Sending..." : "Resend Code"}
                </Button>
              </div>
            </form>

            <div className="bg-dark-400 p-4 rounded-lg border border-dark-500">
              <p className="text-dark-700 text-sm">
                <strong>💡 Tip:</strong> Check your spam folder if you don't see the email. The code expires in 15 minutes.
              </p>
            </div>
          </div>

          <p className="copyright py-12">© 2025 LifeLink - Sagicor Innovation Challenge</p>
        </div>
      </section>

      <Image
        src="/assets/images/onboarding-img.png"
        height={1000}
        width={1000}
        alt="verification"
        className="side-img max-w-[390px]"
      />
    </div>
  );
};
