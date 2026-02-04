import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

import RegisterForm from "@/components/forms/RegisterForm";
import { getPatient } from "@/lib/actions/patient.actions";
import { queryOne } from "@/lib/database/mysql.config";
import { setSessionCookie } from "@/lib/auth.actions";

const RegisterComplete = async () => {
  const store = await cookies();
  const pendingToken = store.get("pending_registration")?.value;

  if (!pendingToken) {
    // No pending registration — send back to signup
    redirect("/register");
  }

  // Verify the pending registration token
  let pending: { email: string; name: string } | null = null;
  try {
    const decoded = jwt.verify(pendingToken, process.env.JWT_SECRET!) as { data: string };
    pending = JSON.parse(decoded.data);
  } catch {
    redirect("/register");
  }

  if (!pending) redirect("/register");

  // Check if patient already completed registration
  const existingPatient = await queryOne<any>(
    "SELECT id, name, email FROM patients WHERE email = ?",
    [pending.email]
  );

  if (existingPatient) {
    // Already registered — create session and go to dashboard
    await setSessionCookie(existingPatient.id, existingPatient.email, existingPatient.name);
    redirect("/dashboard");
  }

  // Load verified user data for the form
  const verification = await queryOne<any>(
    `SELECT name, email FROM email_verifications WHERE email = ? AND is_verified = TRUE ORDER BY verified_at DESC LIMIT 1`,
    [pending.email]
  );

  const user = {
    $id: "", // not used — registerPatient generates the real ID
    name: verification?.name || pending.name,
    email: pending.email,
    phone: verification?.phone || "",
  };

  return (
    <div className="flex h-screen max-h-screen bg-black">
      <section className="remove-scrollbar container my-auto">
        <div className="sub-container max-w-[860px] flex-1 flex-col py-12">
          <RegisterForm user={user} />
          <p className="text-center text-gray-400 text-sm mt-8 mb-4">© 2025 LifeLink</p>
        </div>
      </section>
    </div>
  );
};

export default RegisterComplete;
