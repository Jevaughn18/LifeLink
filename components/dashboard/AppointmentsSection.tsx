"use client";

import { Calendar, Clock, Video, MapPin, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  type: "virtual" | "in-person";
  status: "upcoming" | "today" | "passed";
}

interface AppointmentsSectionProps {
  userId: string;
}

export function AppointmentsSection({ userId }: AppointmentsSectionProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`/api/appointments/list?userId=${userId}`);
        const data = await response.json();

        if (data.success && data.appointments) {
          const formattedAppointments: Appointment[] = data.appointments.map((apt: any) => {
            const appointmentDate = new Date(apt.schedule);
            const today = new Date();
            const isToday = appointmentDate.toDateString() === today.toDateString();
            const isPassed = apt.appointment_status === 'passed';

            return {
              id: apt.id,
              doctor: apt.primary_physician || "Doctor",
              specialty: apt.reason || "General",
              date: isToday
                ? "Today"
                : appointmentDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  }),
              time: appointmentDate.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }),
              type: "in-person" as const,
              status: isPassed ? "passed" : (isToday ? "today" : "upcoming"),
            };
          });

          setAppointments(formattedAppointments);
        }
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [userId]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white dark:bg-black p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
        <p className="text-gray-500 dark:text-gray-400">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-black p-6 shadow-sm border border-gray-200 dark:border-gray-800 transition-all hover:shadow-md">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Your upcoming visits</p>
        </div>
        <Link
          href={`/patients/${userId}/new-appointment`}
          className="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          Book new <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No upcoming appointments</p>
            <Link
              href={`/patients/${userId}/new-appointment`}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 dark:bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-105"
            >
              Book your first appointment
            </Link>
          </div>
        ) : (
          appointments.map((apt) => (
            <div
              key={apt.id}
              className={cn(
                "group flex items-center gap-4 rounded-xl border p-4 transition-all hover:shadow-md",
                apt.status === "today"
                  ? "border-2 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-500/10"
                  : apt.status === "passed"
                  ? "border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 opacity-75"
                  : "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
              )}
            >
              <div
                className={cn(
                  "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl",
                  apt.type === "virtual"
                    ? "bg-blue-100 dark:bg-blue-500/20"
                    : apt.status === "passed"
                    ? "bg-gray-200 dark:bg-gray-700"
                    : "bg-blue-100 dark:bg-blue-500/20"
                )}
              >
                {apt.type === "virtual" ? (
                  <Video className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                ) : (
                  <MapPin className={cn("h-6 w-6", apt.status === "passed" ? "text-gray-400 dark:text-gray-500" : "text-blue-600 dark:text-blue-400")} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={cn("font-medium", apt.status === "passed" ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white")}>{apt.doctor}</h3>
                  {apt.status === "today" && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white shadow-sm">
                      Today
                    </span>
                  )}
                  {apt.status === "passed" && (
                    <span className="rounded-full bg-gray-400 px-2 py-0.5 text-xs font-medium text-white">
                      Passed
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{apt.specialty}</p>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {apt.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {apt.time}
                  </span>
                </div>
              </div>

              {apt.type === "virtual" && apt.status === "today" && (
                <button className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700">
                  Join Call
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
