import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useHealthInsights, transformSymptomCategories } from "@/hooks/use-health-insights";

export function SymptomCategoriesChart() {
  const { data: apiData, isLoading, error } = useHealthInsights();
  const data = transformSymptomCategories(apiData);

  if (isLoading) {
    return (
      <div className="chart-container h-[350px] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading symptoms...</p>
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
        <p className="text-sm text-muted-foreground">No symptom data available</p>
      </div>
    );
  }

  return (
    <div className="chart-container h-[350px]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Top Symptom Categories</h3>
        <p className="text-sm text-muted-foreground">Most reported health conditions</p>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 20%)" horizontal={false} />
          <XAxis
            type="number"
            stroke="hsl(215, 15%, 55%)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="category"
            stroke="hsl(215, 15%, 55%)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(220, 25%, 13%)",
              border: "1px solid hsl(220, 20%, 20%)",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
            labelStyle={{ color: "hsl(210, 20%, 95%)" }}
            formatter={(value: number) => [`${value.toLocaleString()} cases`, "Cases"]}
            cursor={{ fill: "hsl(220, 25%, 15%)" }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
