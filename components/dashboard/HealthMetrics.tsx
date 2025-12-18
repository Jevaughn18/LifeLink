"use client";

import { Activity, Droplets, Moon, Footprints } from "lucide-react";
import { cn } from "@/lib/utils";

interface Metric {
  id: string;
  label: string;
  value: string;
  unit: string;
  icon: React.ElementType;
  trend: "up" | "down" | "stable";
  color: "blue" | "green" | "gray";
}

interface HealthMetricsProps {
  patient?: any;
}

export function HealthMetrics({ patient }: HealthMetricsProps) {
  // In a real app, these would come from patient data
  const metrics: Metric[] = [
    {
      id: "heart",
      label: "Heart Rate",
      value: "72",
      unit: "bpm",
      icon: Activity,
      trend: "stable",
      color: "blue",
    },
    {
      id: "water",
      label: "Hydration",
      value: "6",
      unit: "glasses",
      icon: Droplets,
      trend: "up",
      color: "green",
    },
    {
      id: "sleep",
      label: "Sleep",
      value: "7.5",
      unit: "hours",
      icon: Moon,
      trend: "up",
      color: "gray",
    },
    {
      id: "steps",
      label: "Steps",
      value: "8,432",
      unit: "today",
      icon: Footprints,
      trend: "up",
      color: "green",
    },
  ];

  const colorStyles = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    gray: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <div
          key={metric.id}
          className={cn(
            "rounded-2xl bg-white p-6 shadow-sm border border-gray-100 animate-float-in",
            index === 0 && "stagger-1",
            index === 1 && "stagger-2",
            index === 2 && "stagger-3",
            index === 3 && "stagger-4"
          )}
        >
          <div
            className={cn(
              "mb-4 flex h-12 w-12 items-center justify-center rounded-2xl",
              colorStyles[metric.color]
            )}
          >
            <metric.icon className="h-5 w-5" />
          </div>
          <p className="text-sm text-gray-500">{metric.label}</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-3xl font-semibold text-gray-900">
              {metric.value}
            </span>
            <span className="text-sm text-gray-500">{metric.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
