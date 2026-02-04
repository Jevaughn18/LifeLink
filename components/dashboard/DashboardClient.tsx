"use client";

import { useState, useEffect } from "react";
import { SideNav } from "./SideNav";
import { HealthMetrics } from "./HealthMetrics";
import { AppointmentsSection } from "./AppointmentsSection";
import { InsightsCard } from "./InsightsCard";
import { QuickActionsBar } from "./QuickActionsBar";
import { HealthBotChat } from "./HealthBotChat";
import { VoiceAssistantModal } from "./VoiceAssistantModal";
import { RecordsView } from "./RecordsView";
import { Bell, Search } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";

interface DashboardClientProps {
  patient: any;
  userId: string;
}

export function DashboardClient({ patient, userId }: DashboardClientProps) {
  const [activeSection, setActiveSection] = useState("overview");
  const [showHealthBot, setShowHealthBot] = useState(false);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch('/api/appointments/list');
        const data = await response.json();
        if (data.success) {
          setAppointments(data.appointments || []);
        }
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      }
    };

    fetchAppointments();
  }, [userId]);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const patientName = patient.name || "Patient";
  const firstName = patientName.split(" ")[0];

  // Derive badge counts from raw appointment data
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const upcomingCount = appointments.filter((apt: any) => {
    const aptDate = new Date(apt.schedule);
    return apt.appointment_status !== 'passed' && aptDate >= startOfToday;
  }).length;
  const pastCount = appointments.filter((apt: any) => {
    const aptDate = new Date(apt.schedule);
    return apt.appointment_status === 'passed' || aptDate < startOfToday;
  }).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
      <SideNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        patient={patient}
        appointmentBadge={upcomingCount}
        recordsBadge={pastCount}
      />

      {/* Main Content */}
      <main className="lg:pl-72">
        <div className="mx-auto max-w-6xl px-6 py-8">
          {/* Header */}
          <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="animate-float-in">
              <p className="text-sm text-gray-500 dark:text-gray-400">{currentDate}</p>
              <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white lg:text-4xl">
                Welcome back, <span className="text-blue-600 dark:text-blue-400">{firstName}</span>
              </h1>
            </div>

            <div className="flex items-center gap-3 animate-float-in stagger-1">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="h-10 w-full rounded-xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white pl-10 pr-4 text-sm outline-none transition-colors focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 dark:focus:border-blue-400 sm:w-64"
                />
              </div>
              <ThemeToggle />
              <button className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-black border border-gray-300 dark:border-gray-800 shadow-sm transition-all hover:border-blue-500 dark:hover:border-blue-400">
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-medium text-white">
                  4
                </span>
              </button>
            </div>
          </header>

          {activeSection === "records" ? (
            <RecordsView appointments={appointments} />
          ) : (
            <>
              {/* Quick Actions */}
              <div className="mb-8 animate-float-in stagger-2">
                <QuickActionsBar
                  userId={userId}
                  patientName={patientName}
                  onMessageDoctor={() => setShowHealthBot(true)}
                  onVoiceAssistant={() => setShowVoiceAssistant(true)}
                />
              </div>

              {/* Health Metrics */}
              <div className="mb-8">
                <HealthMetrics patient={patient} userId={userId} />
              </div>

              {/* Main Grid */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column */}
                <div className="space-y-6 lg:col-span-2">
                  <div className="animate-float-in stagger-3">
                    <AppointmentsSection userId={userId} />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6 lg:col-span-1">
                  <div className="animate-float-in stagger-3">
                    <InsightsCard patient={patient} userId={userId} appointments={appointments} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Health Bot Chat */}
      {showHealthBot && (
        <HealthBotChat
          userId={userId}
          patientName={patientName}
          onClose={() => setShowHealthBot(false)}
        />
      )}

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={showVoiceAssistant}
        onClose={() => setShowVoiceAssistant(false)}
        userId={userId}
        patientName={patientName}
      />
    </div>
  );
}
