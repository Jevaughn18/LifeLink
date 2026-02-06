import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  XCircle,
  LayoutDashboard,
  CalendarCheck,
} from "lucide-react";

import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/DataTable";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import { getDoctorAvailability } from "@/lib/actions/doctor-availability.actions";
import { DoctorAvailabilityTable } from "@/components/table/DoctorAvailabilityTable";
import { DoctorAvailabilityModal } from "@/components/DoctorAvailabilityModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InstantConsultBanner } from "@/components/dashboard/InstantConsultBanner";

const AdminPage = async () => {
  const appointments = await getRecentAppointmentList();
  const availability = await getDoctorAvailability();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 transition-colors">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/assets/icons/logo-full.svg"
              height={32}
              width={162}
              alt="LifeLink"
              style={{ height: '32px', width: 'auto' }}
            />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <LayoutDashboard className="h-4 w-4" />
              Admin Dashboard
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Welcome Section */}
        <section>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage appointments and oversee patient care
          </p>
        </section>

        {/* Live instant-consult notifications */}
        <InstantConsultBanner />

        {/* Stats Grid */}
        <section className="grid gap-6 md:grid-cols-3">
          {/* Scheduled Card */}
          <div className="rounded-2xl bg-white dark:bg-black p-6 shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/20">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Scheduled
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {appointments.scheduledCount}
              </p>
            </div>
          </div>

          {/* Pending Card */}
          <div className="rounded-2xl bg-white dark:bg-black p-6 shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/20">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pending
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {appointments.pendingCount}
              </p>
            </div>
          </div>

          {/* Cancelled Card */}
          <div className="rounded-2xl bg-white dark:bg-black p-6 shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/20">
                <XCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cancelled
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {appointments.cancelledCount}
              </p>
            </div>
          </div>
        </section>

        {/* Doctor Availability Section */}
        <section className="rounded-2xl bg-white dark:bg-black shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors">
          <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Doctor Availability
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    Manage doctor working hours and schedules
                  </p>
                </div>
              </div>
              <DoctorAvailabilityModal type="create" />
            </div>
          </div>
          <div className="p-6">
            <DoctorAvailabilityTable data={availability.documents} />
          </div>
        </section>

        {/* Appointments Table */}
        <section className="rounded-2xl bg-white dark:bg-black shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors">
          <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <CalendarCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  All Appointments
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Review and manage patient appointments
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <DataTable columns={columns} data={appointments.documents} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black mt-12 transition-colors">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © 2025 LifeLink. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminPage;
