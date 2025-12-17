import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { PatientGrowthChart } from "@/components/dashboard/PatientGrowthChart";
import { AgeDistributionChart } from "@/components/dashboard/AgeDistributionChart";
import { SymptomCategoriesChart } from "@/components/dashboard/SymptomCategoriesChart";
import { RegionalRiskPreview } from "@/components/dashboard/RegionalRiskPreview";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { useHealthInsights, transformParishData } from "@/hooks/use-health-insights";

export default function Dashboard() {
  const { data: apiData, isLoading } = useHealthInsights();
  const parishData = transformParishData(apiData);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Executive Overview</h1>
            <p className="text-muted-foreground">
              Real-time health analytics for Sagicor Insurance
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/30 rounded-lg">
            <div className="status-dot-success" />
            <span className="text-sm text-success font-medium">All systems operational</span>
          </div>
        </div>

        {/* Key Metrics - Now using real data */}
        <DashboardMetrics />

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PatientGrowthChart />
          <AgeDistributionChart />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SymptomCategoriesChart />
          <RegionalRiskPreview />
          <AlertsPanel />
        </div>

        {/* Quick Stats Table */}
        <div className="chart-container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Parish Performance Summary</h3>
              <p className="text-sm text-muted-foreground">
                Quick overview of key metrics by region
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Parish</th>
                  <th>Patients</th>
                  <th>Avg Risk Score</th>
                  <th>High Risk %</th>
                  <th>Trend</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
                    </td>
                  </tr>
                ) : parishData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No parish data available
                    </td>
                  </tr>
                ) : (
                  parishData.map((parish) => (
                    <tr key={parish.parish}>
                      <td className="font-medium">{parish.parish}</td>
                      <td>{parish.patients}</td>
                      <td>{parish.avgRiskScore}</td>
                      <td>{parish.highRiskPercent}%</td>
                      <td className="trend-up">—</td>
                      <td>
                        <span className={`risk-${parish.riskLevel.toLowerCase()}`}>
                          {parish.riskLevel}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
