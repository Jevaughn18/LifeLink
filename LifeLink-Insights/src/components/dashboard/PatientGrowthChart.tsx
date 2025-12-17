import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useHealthInsights, transformMonthlyGrowth } from "@/hooks/use-health-insights";

export function PatientGrowthChart() {
  const { data: apiData, isLoading, error } = useHealthInsights();
  const data = transformMonthlyGrowth(apiData);

  if (isLoading) {
    return (
      <div className="chart-container h-[350px] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading patient growth...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-container h-[350px] flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-sm text-destructive">Failed to load data</p>
          <p className="text-xs text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="chart-container h-[350px] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No patient growth data available</p>
      </div>
    );
  }

  return (
    <div className="chart-container h-[350px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Patient Growth</h3>
          <p className="text-sm text-muted-foreground">
            Consented patients over time
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-chart-2" />
            <span className="text-sm text-muted-foreground">Total Patients</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-chart-1" />
            <span className="text-sm text-muted-foreground">Appointments</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="patientGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(43, 100%, 55%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(43, 100%, 55%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="appointmentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(210, 100%, 50%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(210, 100%, 50%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 20%)" />
          <XAxis
            dataKey="month"
            stroke="hsl(215, 15%, 55%)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(215, 15%, 55%)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(220, 25%, 13%)",
              border: "1px solid hsl(220, 20%, 20%)",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
            labelStyle={{ color: "hsl(210, 20%, 95%)" }}
            itemStyle={{ color: "hsl(210, 20%, 85%)" }}
          />
          <Area
            type="monotone"
            dataKey="patients"
            stroke="hsl(43, 100%, 55%)"
            strokeWidth={2}
            fill="url(#patientGradient)"
            name="Total Patients"
          />
          <Area
            type="monotone"
            dataKey="appointments"
            stroke="hsl(210, 100%, 50%)"
            strokeWidth={2}
            fill="url(#appointmentGradient)"
            name="Appointments"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
