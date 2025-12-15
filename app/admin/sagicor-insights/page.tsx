import Image from "next/image";
import Link from "next/link";
import { getSagicorDashboardStats } from "@/lib/sagicor/insurance-service";
import { StatCard } from "@/components/StatCard";

const SagicorInsightsPage = async () => {
  const stats = await getSagicorDashboardStats();

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-14">
      <header className="admin-header">
        <Link href="/admin" className="cursor-pointer">
          <Image
            src="/assets/icons/logo-full.svg"
            height={32}
            width={162}
            alt="logo"
            className="h-8 w-fit"
          />
        </Link>

        <div className="flex items-center gap-4">
          <p className="text-16-semibold">Sagicor Health Insights Dashboard</p>
        </div>
      </header>

      <main className="admin-main space-y-8">
        <section className="w-full space-y-4">
          <h1 className="header">Anonymized Health Analytics</h1>
          <p className="text-dark-700">
            Privacy-first insights for better insurance planning and preventive care
          </p>
        </section>

        {/* Overview Stats */}
        <section className="admin-stat">
          <StatCard
            type="appointments"
            count={stats.totalAppointments}
            label="Total Consented Visits"
            icon="/assets/icons/appointments.svg"
          />
          <StatCard
            type="pending"
            count={stats.totalPatients}
            label="Unique Patients (Consented)"
            icon="/assets/icons/user.svg"
          />
          <StatCard
            type="cancelled"
            count={stats.visitTypeDistribution.preventive}
            label="Preventive Care Visits"
            icon="/assets/icons/check.svg"
          />
        </section>

        {/* Risk Distribution */}
        <section className="space-y-4">
          <h2 className="text-24-bold">Risk Category Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-dark-200 p-6 rounded-lg border border-dark-500">
              <p className="text-14-regular text-gray-400">Low Risk</p>
              <p className="text-32-bold text-green-500">{stats.riskDistribution.low}</p>
              <p className="text-12-regular text-gray-500">
                {((stats.riskDistribution.low / stats.totalAppointments) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-dark-200 p-6 rounded-lg border border-dark-500">
              <p className="text-14-regular text-gray-400">Medium Risk</p>
              <p className="text-32-bold text-yellow-500">{stats.riskDistribution.medium}</p>
              <p className="text-12-regular text-gray-500">
                {((stats.riskDistribution.medium / stats.totalAppointments) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-dark-200 p-6 rounded-lg border border-dark-500">
              <p className="text-14-regular text-gray-400">High Risk</p>
              <p className="text-32-bold text-orange-500">{stats.riskDistribution.high}</p>
              <p className="text-12-regular text-gray-500">
                {((stats.riskDistribution.high / stats.totalAppointments) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-dark-200 p-6 rounded-lg border border-dark-500">
              <p className="text-14-regular text-gray-400">Chronic</p>
              <p className="text-32-bold text-red-500">{stats.riskDistribution.chronic}</p>
              <p className="text-12-regular text-gray-500">
                {((stats.riskDistribution.chronic / stats.totalAppointments) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </section>

        {/* Visit Type Distribution */}
        <section className="space-y-4">
          <h2 className="text-24-bold">Visit Type Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-dark-200 p-6 rounded-lg border border-dark-500">
              <p className="text-14-regular text-gray-400">Acute Care</p>
              <p className="text-32-bold text-blue-500">{stats.visitTypeDistribution.acute}</p>
            </div>
            <div className="bg-dark-200 p-6 rounded-lg border border-dark-500">
              <p className="text-14-regular text-gray-400">Chronic Care</p>
              <p className="text-32-bold text-purple-500">{stats.visitTypeDistribution.chronic}</p>
            </div>
            <div className="bg-dark-200 p-6 rounded-lg border border-dark-500">
              <p className="text-14-regular text-gray-400">Preventive</p>
              <p className="text-32-bold text-green-500">{stats.visitTypeDistribution.preventive}</p>
            </div>
            <div className="bg-dark-200 p-6 rounded-lg border border-dark-500">
              <p className="text-14-regular text-gray-400">Emergency</p>
              <p className="text-32-bold text-red-500">{stats.visitTypeDistribution.emergency}</p>
            </div>
          </div>
        </section>

        {/* Urgency Levels */}
        <section className="space-y-4">
          <h2 className="text-24-bold">Urgency Level Tracking</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-dark-200 p-6 rounded-lg border border-dark-500">
              <p className="text-14-regular text-gray-400">Low Urgency</p>
              <p className="text-32-bold">{stats.urgencyDistribution.low}</p>
            </div>
            <div className="bg-dark-200 p-6 rounded-lg border border-dark-500">
              <p className="text-14-regular text-gray-400">Medium Urgency</p>
              <p className="text-32-bold">{stats.urgencyDistribution.medium}</p>
            </div>
            <div className="bg-dark-200 p-6 rounded-lg border border-dark-500">
              <p className="text-14-regular text-gray-400">High Urgency</p>
              <p className="text-32-bold">{stats.urgencyDistribution.high}</p>
            </div>
            <div className="bg-dark-200 p-6 rounded-lg border border-dark-500">
              <p className="text-14-regular text-gray-400">Critical</p>
              <p className="text-32-bold">{stats.urgencyDistribution.critical}</p>
            </div>
          </div>
        </section>

        {/* Regional Health Trends */}
        <section className="space-y-4">
          <h2 className="text-24-bold">Regional Health Trends</h2>
          <div className="bg-dark-200 rounded-lg border border-dark-500 overflow-hidden">
            <table className="w-full">
              <thead className="bg-dark-300">
                <tr>
                  <th className="text-left p-4 text-14-medium text-gray-400">Region</th>
                  <th className="text-left p-4 text-14-medium text-gray-400">Visit Count</th>
                  <th className="text-left p-4 text-14-medium text-gray-400">Average Risk</th>
                </tr>
              </thead>
              <tbody>
                {stats.regionalData.map((region, index) => (
                  <tr key={index} className="border-t border-dark-500">
                    <td className="p-4 text-16-regular">{region.region}</td>
                    <td className="p-4 text-16-regular">{region.count}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-12-semibold ${
                          region.averageRisk === 'Low'
                            ? 'bg-green-500/20 text-green-500'
                            : region.averageRisk === 'Medium'
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : region.averageRisk === 'High'
                            ? 'bg-orange-500/20 text-orange-500'
                            : 'bg-red-500/20 text-red-500'
                        }`}
                      >
                        {region.averageRisk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Key Insights */}
        <section className="space-y-4">
          <h2 className="text-24-bold">Key Insights for Sagicor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-500/10 border border-blue-500/50 p-6 rounded-lg">
              <h3 className="text-18-bold text-blue-500 mb-2">Preventive Care Opportunity</h3>
              <p className="text-14-regular text-gray-300">
                {stats.visitTypeDistribution.preventive} preventive visits out of{" "}
                {stats.totalAppointments} total visits (
                {((stats.visitTypeDistribution.preventive / stats.totalAppointments) * 100).toFixed(1)}
                %). Increasing preventive care can reduce future claims.
              </p>
            </div>
            <div className="bg-green-500/10 border border-green-500/50 p-6 rounded-lg">
              <h3 className="text-18-bold text-green-500 mb-2">Chronic Care Management</h3>
              <p className="text-14-regular text-gray-300">
                {stats.riskDistribution.chronic} chronic risk patients identified. Early
                intervention programs can improve outcomes and reduce costs.
              </p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/50 p-6 rounded-lg">
              <h3 className="text-18-bold text-yellow-500 mb-2">Emergency Prevention</h3>
              <p className="text-14-regular text-gray-300">
                {stats.visitTypeDistribution.emergency} emergency visits could potentially be
                prevented through better primary care access.
              </p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/50 p-6 rounded-lg">
              <h3 className="text-18-bold text-purple-500 mb-2">Regional Focus Areas</h3>
              <p className="text-14-regular text-gray-300">
                {stats.regionalData[0]?.region || "N/A"} has the highest visit count (
                {stats.regionalData[0]?.count || 0}). Consider targeted wellness programs.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Notice */}
        <section className="bg-dark-300 border border-dark-500 p-6 rounded-lg">
          <h3 className="text-18-bold mb-3">🔒 Privacy & Compliance</h3>
          <ul className="space-y-2 text-14-regular text-gray-400">
            <li>✓ All data is fully anonymized - no patient names or personal identifiers</li>
            <li>✓ Only includes patients who explicitly consented to data sharing</li>
            <li>✓ No medical diagnoses or treatment details are shared</li>
            <li>✓ Aggregated insights only - individual patient data never exposed</li>
            <li>✓ Compliant with HIPAA and data protection regulations</li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default SagicorInsightsPage;
