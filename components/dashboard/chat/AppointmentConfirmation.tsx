"use client";

import { CheckCircle2, Calendar, Clock, User, FileText } from "lucide-react";

interface AppointmentConfirmationProps {
  appointment: {
    id: string;
    doctor: string;
    date: string;
    time: string;
    reason: string;
  };
}

export function AppointmentConfirmation({ appointment }: AppointmentConfirmationProps) {
  const formattedDate = new Date(appointment.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = new Date(`${appointment.date}T${appointment.time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="mt-4 rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 overflow-hidden shadow-lg shadow-green-500/10 animate-in zoom-in duration-500">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <CheckCircle2 className="h-7 w-7 text-white animate-in zoom-in duration-300 delay-100" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">
              Appointment Confirmed!
            </h3>
            <p className="text-sm text-green-100">
              Your request has been submitted
            </p>
          </div>
        </div>
      </div>

      {/* Appointment Details */}
      <div className="p-5 space-y-4">
        <div className="grid gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 flex-shrink-0">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Doctor
              </p>
              <p className="text-base font-semibold text-gray-900 mt-0.5">
                Dr. {appointment.doctor}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 flex-shrink-0">
              <Calendar className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Date
              </p>
              <p className="text-base font-semibold text-gray-900 mt-0.5">
                {formattedDate}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 flex-shrink-0">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Time
              </p>
              <p className="text-base font-semibold text-gray-900 mt-0.5">
                {formattedTime}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 flex-shrink-0">
              <FileText className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Reason
              </p>
              <p className="text-base font-semibold text-gray-900 mt-0.5">
                {appointment.reason}
              </p>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="pt-3 border-t border-green-200">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300">
            <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
            <p className="text-sm font-medium text-yellow-800">
              Status: <span className="font-bold">Pending Approval</span>
            </p>
          </div>
          <p className="text-xs text-gray-600 mt-2 px-1">
            You'll receive a confirmation email once the appointment is approved by our staff.
          </p>
        </div>

        {/* Appointment ID */}
        <div className="pt-2">
          <p className="text-xs text-gray-500">
            Appointment ID: <span className="font-mono font-medium text-gray-700">{appointment.id.slice(0, 8)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
