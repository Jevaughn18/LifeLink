import { MetricCard } from "@/components/dashboard/MetricCard";
import { useHealthInsights, extractMetrics } from "@/hooks/use-health-insights";
import { Users, Calendar, ShieldAlert, Activity } from "lucide-react";

export function DashboardMetrics() {
  const { data, isLoading } = useHealthInsights();
  const metrics = extractMetrics(data);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-[140px] bg-muted rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="animate-slide-up stagger-1 opacity-0">
        <MetricCard
          title="Total Consented Patients"
          value={metrics.totalPatients.toLocaleString()}
          change={12.5}
          icon={Users}
          variant="gold"
        />
      </div>
      <div className="animate-slide-up stagger-2 opacity-0">
        <MetricCard
          title="Active Appointments"
          value={metrics.totalAppointments.toLocaleString()}
          change={8.2}
          changeLabel="this month"
          icon={Calendar}
          variant="default"
        />
      </div>
      <div className="animate-slide-up stagger-3 opacity-0">
        <MetricCard
          title="High-Risk Patients"
          value={metrics.highRiskPatients.toLocaleString()}
          change={-5.3}
          icon={ShieldAlert}
          variant="danger"
        />
      </div>
      <div className="animate-slide-up stagger-4 opacity-0">
        <MetricCard
          title="Average Risk Score"
          value={metrics.averageRiskScore.toFixed(1)}
          change={2.1}
          changeLabel={`from ${(metrics.averageRiskScore - 0.1).toFixed(1)}`}
          icon={Activity}
          variant="warning"
        />
      </div>
    </div>
  );
}
