"use client";

import { Calendar, Clock, MapPin } from "lucide-react";

interface RecordsViewProps {
  appointments: any[];
}

export function RecordsView({ appointments }: RecordsViewProps) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const pastAppointments = appointments
    .filter((apt: any) => {
      const aptDate = new Date(apt.schedule);
      return apt.appointment_status === 'passed' || aptDate < startOfToday;
    })
    .sort((a: any, b: any) => new Date(b.schedule).getTime() - new Date(a.schedule).getTime());

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Records</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">All past visits</p>
      </div>

      <div className="rounded-2xl bg-white dark:bg-black shadow-sm border border-gray-200 dark:border-gray-800">
        {pastAppointments.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400">No past appointments yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {pastAppointments.map((apt: any) => {
              const aptDate = new Date(apt.schedule);
              return (
                <div
                  key={apt.id}
                  className="flex items-center gap-4 p-5 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-500/20">
                    <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {apt.primary_physician || "Doctor"}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{apt.reason || "General"}</p>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {aptDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {aptDate.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </div>
                  </div>

                  <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                    Completed
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
