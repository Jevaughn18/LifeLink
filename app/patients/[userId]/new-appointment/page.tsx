import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { getPatient } from "@/lib/actions/patient.actions";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";

const Appointment = async ({ params: { userId } }: SearchParamProps) => {
  const patient = await getPatient(userId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-10 transition-colors">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <Link
            href={`/patients/${userId}/dashboard`}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 md:p-12 shadow-xl border border-gray-200/50 dark:border-gray-800/50 transition-colors">
          {/* Page Header */}
          <div className="mb-10">
            <div className="flex items-start gap-5 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Book Appointment
                </h1>
                <p className="text-base text-gray-600 dark:text-gray-300">
                  Schedule your next visit in just a few simple steps
                </p>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-500"></div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Fill Details</span>
              </div>
              <div className="h-px w-8 bg-gray-300 dark:bg-gray-700"></div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Review</span>
              </div>
              <div className="h-px w-8 bg-gray-300 dark:bg-gray-700"></div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Confirm</span>
              </div>
            </div>
          </div>

          {/* Appointment Form */}
          <div className="mt-8">
            <AppointmentForm
              patientId={patient?.$id}
              userId={userId}
              type="create"
            />
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          © 2025 LifeLink. All rights reserved.
        </p>
      </main>
    </div>
  );
};

export default Appointment;
