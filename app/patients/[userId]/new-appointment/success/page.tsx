import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Calendar, User, ArrowRight } from "lucide-react";

import { Doctors } from "@/constants";
import { getAppointment } from "@/lib/actions/appointment.actions";
import { formatDateTime } from "@/lib/utils";

const RequestSuccess = async ({
  searchParams,
  params: { userId },
}: SearchParamProps) => {
  const appointmentId = (searchParams?.appointmentId as string) || "";
  const appointment = await getAppointment(appointmentId);

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-600">Appointment not found</p>
          <Link
            href={`/patients/${userId}/dashboard`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-blue-700 mt-4"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const doctor = Doctors.find(
    (doctor) => doctor.name === appointment.primaryPhysician
  );

  const formattedDate = formatDateTime(appointment.schedule);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-6 transition-colors">
      <div className="w-full max-w-2xl">
        {/* Success Card */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-sm border border-gray-100 dark:border-gray-800 text-center transition-colors">
          {/* Success Animation */}
          <div className="mb-6 flex justify-center">
            <Image
              src="/assets/gifs/success.gif"
              height={280}
              width={280}
              alt="success"
              className="w-64 h-auto"
            />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Appointment Requested!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Your appointment request has been successfully submitted. We'll be in touch shortly by email to confirm.
          </p>

          {/* Appointment Details Card */}
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-6 mb-8 text-left transition-colors">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
              Appointment Details
            </h2>

            <div className="space-y-4">
              {/* Doctor */}
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600">
                  {doctor?.image ? (
                    <Image
                      src={doctor.image}
                      alt={doctor.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Doctor</p>
                  <p className="font-semibold text-gray-900 dark:text-white">Dr. {doctor?.name}</p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Date & Time</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{formattedDate.dateTime}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/patients/${userId}/dashboard`}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-blue-700 shadow-lg hover:shadow-xl"
            >
              Go to Dashboard
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href={`/patients/${userId}/new-appointment`}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-3 text-base font-semibold text-gray-900 dark:text-white transition-all hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Book Another
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          © 2025 LifeLink. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default RequestSuccess;
