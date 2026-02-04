"use client";

import { Calendar, CheckCircle, Clock, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface Metric {
  id: string;
  label: string;
  value: string;
  unit: string;
  icon: React.ElementType;
  color: "blue" | "green" | "amber" | "purple";
}

interface HealthMetricsProps {
  patient?: any;
  userId: string;
}

export function HealthMetrics({ patient, userId }: HealthMetricsProps) {
  const [metrics, setMetrics] = useState<Metric[]>([
    {
      id: "total",
      label: "Total Appointments",
      value: "0",
      unit: "Total",
      icon: ListChecks,
      color: "blue",
    },
    {
      id: "next",
      label: "Next Appointment",
      value: "None",
      unit: "scheduled",
      icon: Calendar,
      color: "green",
    },
    {
      id: "completed",
      label: "Completed Visits",
      value: "0",
      unit: "Completed",
      icon: CheckCircle,
      color: "purple",
    },
    {
      id: "pending",
      label: "Pending Requests",
      value: "0",
      unit: "Pending",
      icon: Clock,
      color: "amber",
    },
  ]);

  useEffect(() => {
    // Fetch real appointment data
    const fetchAppointmentStats = async () => {
      try {
        const response = await fetch('/api/appointments/stats');
        const data = await response.json();

        if (data.success) {
          setMetrics([
            {
              id: "total",
              label: "Total Appointments",
              value: data.total.toString(),
              unit: "Total",
              icon: ListChecks,
              color: "blue",
            },
            {
              id: "next",
              label: "Next Appointment",
              value: data.nextAppointment || "None",
              unit: data.nextAppointment ? "" : "scheduled",
              icon: Calendar,
              color: "green",
            },
            {
              id: "completed",
              label: "Completed Visits",
              value: data.completed.toString(),
              unit: "Completed",
              icon: CheckCircle,
              color: "purple",
            },
            {
              id: "pending",
              label: "Pending Requests",
              value: data.pending.toString(),
              unit: "Pending",
              icon: Clock,
              color: "amber",
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch appointment stats:", error);
      }
    };

    fetchAppointmentStats();
  }, [userId]);

  const colorStyles = {
    blue: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
    green: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
    amber: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
    purple: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
  };

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <div
          key={metric.id}
          className={cn(
            "rounded-2xl bg-white dark:bg-black p-6 shadow-sm border border-gray-200 dark:border-gray-800 animate-float-in transition-all hover:shadow-md hover:border-blue-500 dark:hover:border-blue-400",
            index === 0 && "stagger-1",
            index === 1 && "stagger-2",
            index === 2 && "stagger-3",
            index === 3 && "stagger-4"
          )}
        >
          <div
            className={cn(
              "mb-4 flex h-12 w-12 items-center justify-center rounded-xl",
              colorStyles[metric.color]
            )}
          >
            <metric.icon className="h-5 w-5" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-3xl font-semibold text-gray-900 dark:text-white">
              {metric.value}
            </span>
            {metric.unit && (
              <span className="text-sm text-gray-600 dark:text-gray-400">{metric.unit}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
