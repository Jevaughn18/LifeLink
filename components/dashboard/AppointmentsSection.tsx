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
  status: "upcoming" | "today";
}

interface AppointmentsSectionProps {
  userId: string;
}

export function AppointmentsSection({ userId }: AppointmentsSectionProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch real appointments from database
    // For now, using mock data
    const mockAppointments: Appointment[] = [
      {
        id: "1",
        doctor: "Dr. Maya Patel",
        specialty: "Cardiologist",
        date: "Today",
        time: "2:30 PM",
        type: "virtual",
        status: "today",
      },
      {
        id: "2",
        doctor: "Dr. James Wilson",
        specialty: "General Physician",
        date: "Dec 22",
        time: "10:00 AM",
        type: "in-person",
        status: "upcoming",
      },
    ];

    setAppointments(mockAppointments);
    setLoading(false);
  }, [userId]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <p className="text-gray-500">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
          <p className="mt-1 text-sm text-gray-500">Your upcoming visits</p>
        </div>
        <Link
          href={`/patients/${userId}/new-appointment`}
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          Book new <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No upcoming appointments</p>
            <Link
              href={`/patients/${userId}/new-appointment`}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-105"
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
                  ? "border-blue-200 bg-blue-50"
                  : "border-gray-200"
              )}
            >
              <div
                className={cn(
                  "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl",
                  apt.type === "virtual" ? "bg-green-100" : "bg-gray-100"
                )}
              >
                {apt.type === "virtual" ? (
                  <Video className="h-6 w-6 text-green-600" />
                ) : (
                  <MapPin className="h-6 w-6 text-gray-600" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">{apt.doctor}</h3>
                  {apt.status === "today" && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                      Today
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{apt.specialty}</p>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
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
                <button className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-105">
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
