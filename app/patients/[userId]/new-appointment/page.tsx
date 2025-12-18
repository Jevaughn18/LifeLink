import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { getPatient } from "@/lib/actions/patient.actions";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";

const Appointment = async ({ params: { userId } }: SearchParamProps) => {
  const patient = await getPatient(userId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <Link
            href={`/patients/${userId}/dashboard`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
          {/* Page Header */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600">
              <Calendar className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Book Appointment
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Schedule your next visit in just a few steps
              </p>
            </div>
          </div>

          {/* Appointment Form */}
          <AppointmentForm
            patientId={patient?.$id}
            userId={userId}
            type="create"
          />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          © 2025 LifeLink. All rights reserved.
        </p>
      </main>
    </div>
  );
};

export default Appointment;
