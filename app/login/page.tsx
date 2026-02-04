import Image from "next/image";
import Link from "next/link";

import { PatientLoginForm } from "@/components/forms/PatientLoginForm";
import DoodleAnimationSlideshow from "@/components/DoodleAnimationSlideshow";

const LoginPage = () => {
  return (
    <div className="flex h-screen max-h-screen overflow-hidden">
      {/* Left side - Animation (50%) */}
      <div className="hidden md:flex md:w-1/2 h-full">
        <DoodleAnimationSlideshow />
      </div>

      {/* Right side - Form (50%) */}
      <section className="w-full md:w-1/2 h-full flex items-center justify-center bg-white dark:bg-black overflow-hidden transition-colors">
        <div className="w-full max-w-[496px] px-8">
          <Image
            src="/assets/logo.svg"
            height={1000}
            width={1000}
            alt="patient"
            className="mb-12 h-17 w-fit"
          />

          <PatientLoginForm />

          <div className="text-14-regular mt-8 flex justify-center gap-2">
            <p className="text-gray-600 dark:text-gray-400">Don't have an account?</p>
            <Link href="/" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Sign up
            </Link>
          </div>

          <div className="text-14-regular mt-12 flex justify-between">
            <p className="text-gray-500 dark:text-gray-400">
              © 2025 LifeLink
            </p>
            <Link href="/?admin=true" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Admin
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
