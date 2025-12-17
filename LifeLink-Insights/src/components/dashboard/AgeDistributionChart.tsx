import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useHealthInsights, transformAgeDistribution } from "@/hooks/use-health-insights";

export function AgeDistributionChart() {
  const { data: apiData, isLoading, error } = useHealthInsights();
  const data = transformAgeDistribution(apiData);

  if (isLoading) {
    return (
      <div className="chart-container h-[350px] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading age distribution...</p>
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
        <p className="text-sm text-muted-foreground">No age distribution data available</p>
      </div>
    );
  }

  return (
    <div className="chart-container h-[350px]">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Age Distribution</h3>
        <p className="text-sm text-muted-foreground">Patient demographics breakdown</p>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            stroke="hsl(220, 25%, 10%)"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(220, 25%, 13%)",
              border: "1px solid hsl(220, 20%, 20%)",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
            labelStyle={{ color: "hsl(210, 20%, 95%)" }}
            formatter={(value: number) => [`${value.toLocaleString()} patients`, ""]}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            formatter={(value) => (
              <span style={{ color: "hsl(215, 15%, 55%)", fontSize: "12px" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
