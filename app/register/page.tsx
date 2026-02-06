import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";

import { PatientForm } from "@/components/forms/PatientForm";
import DoodleAnimationSlideshow from "@/components/DoodleAnimationSlideshow";

const RegisterPage = () => {
  return (
    <div className="flex h-screen max-h-screen overflow-hidden light" style={{ backgroundColor: 'hsl(150, 15%, 95%)' }}>
      {/* Left side - Animation (50%) */}
      <div className="hidden md:flex md:w-1/2 h-full">
        <DoodleAnimationSlideshow />
      </div>

      {/* Right side - Form (50%) */}
      <section className="w-full md:w-1/2 h-full flex items-center justify-center overflow-y-auto" data-light-mode="true">
        <div className="w-full max-w-[496px] px-8 py-12">
          {/* Back to Home Link */}
          <div className="flex justify-end mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
          </div>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-12">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              LifeLink
            </span>
          </Link>

          {/* Registration Form */}
          <PatientForm />

          {/* Login link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-500 font-semibold hover:text-blue-600 transition-colors">
                Login
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-12 flex justify-between items-center text-sm">
            <p className="text-gray-500">© 2026 LifeLink</p>
            <Link href="/" className="text-gray-600 font-semibold hover:text-gray-900 transition-colors">
              Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RegisterPage;
