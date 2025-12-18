import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, XCircle, LayoutDashboard } from "lucide-react";

import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/DataTable";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";

const AdminPage = async () => {
  const appointments = await getRecentAppointmentList();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/assets/icons/logo-full.svg"
              height={32}
              width={162}
              alt="LifeLink"
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <LayoutDashboard className="h-4 w-4" />
            Admin Dashboard
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Welcome Section */}
        <section>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-1">
            Manage appointments and oversee patient care
          </p>
        </section>

        {/* Stats Grid */}
        <section className="grid gap-6 md:grid-cols-3">
          {/* Scheduled Card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                Active
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-3xl font-bold text-gray-900">
                {appointments.scheduledCount}
              </p>
            </div>
          </div>

          {/* Pending Card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                Needs Action
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-gray-900">
                {appointments.pendingCount}
              </p>
            </div>
          </div>

          {/* Cancelled Card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                Cancelled
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-3xl font-bold text-gray-900">
                {appointments.cancelledCount}
              </p>
            </div>
          </div>
        </section>

        {/* Appointments Table */}
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">All Appointments</h2>
            <p className="text-sm text-gray-500 mt-1">
              Review and manage patient appointments
            </p>
          </div>
          <DataTable columns={columns} data={appointments.documents} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2025 LifeLink. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminPage;
