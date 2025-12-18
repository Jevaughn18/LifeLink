"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EmailVerificationForm } from "@/components/forms/EmailVerificationForm";
import { createUser } from "@/lib/actions/patient.actions";
import { checkEmailVerificationStatus } from "@/lib/actions/verification.actions";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!email) {
      router.push("/");
      return;
    }

    // Check if email is already verified
    const checkVerificationStatus = async () => {
      try {
        const status = await checkEmailVerificationStatus(email);

        if (status.isVerified && status.verificationData) {
          // Email already verified - proceed directly to registration
          const newUser = await createUser({
            name: status.verificationData.name,
            email: status.verificationData.email,
            password: status.verificationData.passwordHash,
          });

          if (newUser) {
            // Store temp user ID in verification record
            await fetch('/api/store-temp-user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: status.verificationData.email,
                tempUserId: newUser.$id
              })
            });

            router.push(`/patients/${newUser.$id}/register`);
          }
        } else {
          // Email not verified yet - show verification form
          setIsChecking(false);
        }
      } catch (error) {
        console.error("Error checking verification status:", error);
        setIsChecking(false);
      }
    };

    checkVerificationStatus();
  }, [email, router]);

  const handleVerified = async (data: { name: string; email: string; passwordHash: string }) => {
    try {
      // Create user after email verification
      const newUser = await createUser({
        name: data.name,
        email: data.email,
        password: data.passwordHash,
      });

      if (newUser) {
        // Store temp user ID in verification record for later retrieval
        await fetch('/api/store-temp-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            tempUserId: newUser.$id
          })
        });

        // Redirect to registration page with verified email
        router.push(`/patients/${newUser.$id}/register`);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to proceed to registration. Please try again.");
    }
  };

  if (!email || isChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-700">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          <p className="text-white text-lg">Checking verification status...</p>
        </div>
      </div>
    );
  }

  return <EmailVerificationForm email={email} onVerified={handleVerified} />;
}
