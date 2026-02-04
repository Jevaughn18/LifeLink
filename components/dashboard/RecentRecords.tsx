"use client";

import { Pill, Activity, Calendar, Droplet, Heart, TrendingUp } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface Record {
  id: string;
  title: string;
  type: "medication" | "vitals" | "appointment" | "lab";
  date: string;
  value?: string;
  status?: "normal" | "warning" | "critical";
}

interface RecentRecordsProps {
  patient?: any;
  appointments?: any[];
}

export function RecentRecords({ patient, appointments }: RecentRecordsProps) {
  // Generate dynamic records based on patient data
  const records: Record[] = [];

  // Add current medications
  if (patient?.currentMedication && patient.currentMedication.trim() !== '') {
    const meds = patient.currentMedication.split(',').map((m: string) => m.trim());
    meds.slice(0, 2).forEach((med: string, idx: number) => {
      records.push({
        id: `med-${idx}`,
        title: med,
        type: "medication",
        date: "Active prescription",
        value: "Daily"
      });
    });
  }

  // Add past appointments
  if (appointments && appointments.length > 0) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const past = appointments
      .filter((apt: any) => {
        const aptDate = new Date(apt.schedule);
        return apt.appointment_status === 'passed' || aptDate < startOfToday;
      })
      .sort((a: any, b: any) => new Date(b.schedule).getTime() - new Date(a.schedule).getTime())
      .slice(0, 3);

    past.forEach((apt: any, idx: number) => {
      records.push({
        id: `past-apt-${idx}`,
        title: `Visit with ${apt.primary_physician || 'Doctor'}`,
        type: "appointment",
        date: formatDateTime(apt.schedule).dateOnly,
        value: formatDateTime(apt.schedule).timeOnly
      });
    });
  }

  // Add health tracking suggestions
  if (patient?.pastMedicalHistory && patient.pastMedicalHistory.toLowerCase().includes('hypertension')) {
    records.push({
      id: "vitals-bp",
      title: "Blood Pressure Check",
      type: "vitals",
      date: "Due this week",
      value: "Track your BP",
      status: "warning"
    });
  }

  if (patient?.pastMedicalHistory && patient.pastMedicalHistory.toLowerCase().includes('diabetes')) {
    records.push({
      id: "vitals-glucose",
      title: "Blood Glucose Monitoring",
      type: "lab",
      date: "Due this week",
      value: "Track daily",
      status: "normal"
    });
  }

  // If no records, show helpful defaults
  if (records.length === 0) {
    records.push(
      {
        id: "default-1",
        title: "Schedule Your First Checkup",
        type: "appointment",
        date: "No appointments yet",
        value: "Book now"
      },
      {
        id: "default-2",
        title: "Complete Health Profile",
        type: "vitals",
        date: "Add medical history",
        value: "Update profile"
      }
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "medication":
        return <Pill className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case "vitals":
        return <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case "appointment":
        return <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      case "lab":
        return <Droplet className="h-5 w-5 text-red-600 dark:text-red-400" />;
      default:
        return <Heart className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "critical":
        return "bg-red-100 dark:bg-red-500/20 border-red-200 dark:border-red-500/30";
      case "warning":
        return "bg-yellow-100 dark:bg-yellow-500/20 border-yellow-200 dark:border-yellow-500/30";
      default:
        return "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800";
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-black p-6 shadow-sm border border-gray-200 dark:border-gray-800 transition-all hover:shadow-md">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Records</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Past visits & health tracking</p>
        </div>
        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
      </div>

      <div className="space-y-3">
        {records.slice(0, 4).map((record) => (
          <div
            key={record.id}
            className={`group flex items-center gap-3 rounded-xl p-3 transition-all hover:shadow-sm border ${getStatusColor(record.status)}`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-gray-800 shadow-sm">
              {getIcon(record.type)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-gray-900 dark:text-white text-sm">{record.title}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {record.date} {record.value && `· ${record.value}`}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-5 w-full rounded-xl bg-blue-50 dark:bg-blue-500/10 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 transition-all hover:bg-blue-100 dark:hover:bg-blue-500/20">
        View Full Health Records
      </button>
    </div>
  );
}
