"use client";

import { useState } from "react";
import { SideNav } from "./SideNav";
import { HealthMetrics } from "./HealthMetrics";
import { AppointmentsSection } from "./AppointmentsSection";
import { MedicationsCard } from "./MedicationsCard";
import { RecentRecords } from "./RecentRecords";
import { InsightsCard } from "./InsightsCard";
import { QuickActionsBar } from "./QuickActionsBar";
import { Bell, Search } from "lucide-react";

interface DashboardClientProps {
  patient: any;
  userId: string;
}

export function DashboardClient({ patient, userId }: DashboardClientProps) {
  const [activeSection, setActiveSection] = useState("overview");

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const patientName = patient.name || "Patient";
  const firstName = patientName.split(" ")[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <SideNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        patient={patient}
      />

      {/* Main Content */}
      <main className="lg:pl-72">
        <div className="mx-auto max-w-6xl px-6 py-8">
          {/* Header */}
          <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="animate-float-in">
              <p className="text-sm text-gray-500">{currentDate}</p>
              <h1 className="mt-1 text-3xl font-bold text-gray-900 lg:text-4xl">
                Welcome back, {firstName} 👋
              </h1>
            </div>

            <div className="flex items-center gap-3 animate-float-in stagger-1">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-blue-500/20 sm:w-64"
                />
              </div>
              <button className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm transition-transform hover:scale-105">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-medium text-white">
                  4
                </span>
              </button>
            </div>
          </header>

          {/* Quick Actions */}
          <div className="mb-8 animate-float-in stagger-2">
            <QuickActionsBar userId={userId} />
          </div>

          {/* Health Metrics */}
          <div className="mb-8">
            <HealthMetrics patient={patient} />
          </div>

          {/* Main Grid */}
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Left Column */}
            <div className="space-y-6 lg:col-span-3">
              <div className="animate-float-in stagger-3">
                <AppointmentsSection userId={userId} />
              </div>
              <div className="animate-float-in stagger-4">
                <RecentRecords patient={patient} />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6 lg:col-span-2">
              <div className="animate-float-in stagger-3">
                <MedicationsCard patient={patient} />
              </div>
              <div className="animate-float-in stagger-4">
                <InsightsCard patient={patient} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
