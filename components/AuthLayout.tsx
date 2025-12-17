"use client";

import React, { useState } from "react";
import Image from "next/image";
import DoodleAnimationSlideshow from "./DoodleAnimationSlideshow";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const [showAnimations, setShowAnimations] = useState(true);

  const handleSkipAnimations = () => {
    setShowAnimations(false);
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Animation Section - Hidden on small screens, shown on large screens */}
      {showAnimations && (
        <div className="relative hidden min-h-screen w-full lg:flex lg:w-1/2">
          <DoodleAnimationSlideshow onSkip={handleSkipAnimations} />
          <div className="absolute bottom-4 left-4 z-10">
            <Image
              src="/assets/icons/logo-full.svg"
              height={32}
              width={162}
              alt="LifeLink Logo"
              className="h-8 w-auto"
            />
          </div>
        </div>
      )}

      {/* Form Section */}
      <div
        className={`flex h-full items-center justify-center p-4 lg:p-8 ${
          showAnimations ? "lg:w-1/2" : "w-full"
        } overflow-y-auto`}
      >
        <div className="w-full max-w-lg space-y-8 h-full overflow-y-auto">
          {!showAnimations && (
            <div className="flex justify-center lg:hidden">
              <Image
                src="/assets/icons/logo-full.svg"
                height={32}
                width={162}
                alt="LifeLink Logo"
                className="h-8 w-auto"
              />
            </div>
          )}
          {children}
          {/* Add a generic copyright outside of children, if not already present in children directly */}
          <div className="text-14-regular mt-12 flex justify-center text-dark-600">
            © 2025 LifeLink
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;