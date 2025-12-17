import Image from "next/image";
import Link from "next/link";

import { PatientLoginForm } from "@/components/forms/PatientLoginForm";
import AuthLayout from "@/components/AuthLayout"; // Import AuthLayout

const LoginPage = () => {
  return (
    <AuthLayout>
      <div className="sub-container max-w-[496px]">
        <Image
          src="/assets/icons/logo-full.svg"
          height={1000}
          width={1000}
          alt="patient"
          className="mb-12 h-10 w-fit"
        />

        <PatientLoginForm />

        <div className="text-14-regular mt-8 flex justify-center gap-2">
          <p className="text-dark-600">Don't have an account?</p>
                      <Link href="/register" className="text-indigo-600">            Sign up
          </Link>
        </div>

        <div className="text-14-regular mt-12 flex justify-between">
          <p className="justify-items-end text-dark-600 xl:text-left">
            © 2025 LifeLynk
          </p>
                      <Link href="/?admin=true" className="text-indigo-600">            Admin
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
