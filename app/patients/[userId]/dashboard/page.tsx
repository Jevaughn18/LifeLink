import { getPatient } from "@/lib/actions/patient.actions";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

const PatientDashboard = async ({ params: { userId } }: SearchParamProps) => {
  const patient = await getPatient(userId);

  if (!patient) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-600">Patient not found</p>
      </div>
    );
  }

  return <DashboardClient patient={patient} userId={userId} />;
};

export default PatientDashboard;
