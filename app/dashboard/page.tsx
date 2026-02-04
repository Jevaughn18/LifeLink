import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getPatient } from "@/lib/actions/patient.actions";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { redirect } from "next/navigation";

const PatientDashboard = async () => {
  const store = await cookies();
  const token = store.get("session")?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) redirect("/login");

  const patient = await getPatient(user.patientId);

  if (!patient) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-600">Patient not found</p>
      </div>
    );
  }

  return <DashboardClient patient={patient} userId={user.patientId} />;
};

export default PatientDashboard;
