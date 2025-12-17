import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertTriangle, TrendingUp, DollarSign, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const predictionData = [
  { month: "Jan 2026", predicted: 1200, estimated: 450, confidence: 87 },
  { month: "Feb 2026", predicted: 1280, estimated: 485, confidence: 85 },
  { month: "Mar 2026", predicted: 1350, estimated: 510, confidence: 83 },
  { month: "Apr 2026", predicted: 1420, estimated: 540, confidence: 81 },
  { month: "May 2026", predicted: 1380, estimated: 520, confidence: 82 },
  { month: "Jun 2026", predicted: 1450, estimated: 550, confidence: 80 },
];

const chartData = [
  { month: "Jul", actual: 980, predicted: 950 },
  { month: "Aug", actual: 1050, predicted: 1020 },
  { month: "Sep", actual: 1120, predicted: 1080 },
  { month: "Oct", actual: 1180, predicted: 1150 },
  { month: "Nov", actual: 1250, predicted: 1200 },
  { month: "Dec", actual: null, predicted: 1280 },
  { month: "Jan", actual: null, predicted: 1350 },
  { month: "Feb", actual: null, predicted: 1400 },
];

const regionalAlerts = [
  { region: "Kingston", status: "over", percentage: 15, budget: "$180K", forecast: "$207K" },
  { region: "St. Andrew", status: "at-risk", percentage: 8, budget: "$150K", forecast: "$162K" },
  { region: "St. James", status: "over", percentage: 12, budget: "$120K", forecast: "$134K" },
];

export default function ClaimsPrediction() {
  const [budget, setBudget] = useState("2500000");

  const totalPredictedClaims = predictionData.reduce((sum, m) => sum + m.predicted, 0);
  const totalEstimatedCost = predictionData.reduce((sum, m) => sum + m.estimated, 0);
  const budgetNum = parseInt(budget) || 0;
  const budgetStatus = totalEstimatedCost * 1000 > budgetNum ? "over" : "within";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Claims Prediction</h1>
          <p className="text-muted-foreground">
            AI-powered claims forecasting based on appointment trends
          </p>
        </div>

        {/* Budget Planning Tool */}
        <div className="chart-container">
          <div className="flex items-center gap-3 mb-6">
            <Target className="h-6 w-6 text-secondary" />
            <h3 className="text-lg font-semibold">Budget Planning Tool</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Expected Claims Budget (Annual)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
            
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Projected Annual Cost</p>
              <p className="text-2xl font-bold font-mono text-secondary">
                ${(totalEstimatedCost * 1000).toLocaleString()}
              </p>
            </div>
            
            <div className={cn(
              "p-4 rounded-lg border",
              budgetStatus === "over" ? "bg-destructive/10 border-destructive/30" : "bg-success/10 border-success/30"
            )}>
              <p className="text-sm text-muted-foreground">Budget Status</p>
              <p className={cn(
                "text-2xl font-bold",
                budgetStatus === "over" ? "text-destructive" : "text-success"
              )}>
                {budgetStatus === "over" ? "Over Budget" : "Within Budget"}
              </p>
              {budgetStatus === "over" && (
                <p className="text-sm text-destructive mt-1">
                  +${((totalEstimatedCost * 1000) - budgetNum).toLocaleString()} excess
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Prediction Chart */}
        <div className="chart-container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Claims Volume Forecast</h3>
              <p className="text-sm text-muted-foreground">Actual vs predicted claims over time</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-chart-2" />
                <span className="text-sm text-muted-foreground">Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-chart-1" />
                <span className="text-sm text-muted-foreground">Predicted</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(43, 100%, 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(43, 100%, 55%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(210, 100%, 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(210, 100%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 20%)" />
                <XAxis dataKey="month" stroke="hsl(215, 15%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(220, 25%, 13%)",
                    border: "1px solid hsl(220, 20%, 20%)",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(43, 100%, 55%)"
                  strokeWidth={2}
                  fill="url(#actualGradient)"
                  name="Actual Claims"
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="hsl(210, 100%, 50%)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#predictedGradient)"
                  name="Predicted Claims"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prediction Table */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold mb-4">6-Month Claims Forecast</h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Predicted Claims</th>
                  <th>Estimated Cost</th>
                  <th>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {predictionData.map((row) => (
                  <tr key={row.month}>
                    <td className="font-medium">{row.month}</td>
                    <td className="font-mono">{row.predicted.toLocaleString()}</td>
                    <td className="font-mono text-secondary">${row.estimated}K</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-20">
                          <div
                            className="h-full bg-success rounded-full"
                            style={{ width: `${row.confidence}%` }}
                          />
                        </div>
                        <span className="font-mono text-sm">{row.confidence}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Regional Alerts */}
        <div className="chart-container">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="h-6 w-6 text-warning" />
            <h3 className="text-lg font-semibold">Regional Budget Alerts</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {regionalAlerts.map((alert) => (
              <div
                key={alert.region}
                className={cn(
                  "p-4 rounded-lg border",
                  alert.status === "over" && "bg-destructive/10 border-destructive/30",
                  alert.status === "at-risk" && "bg-warning/10 border-warning/30"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{alert.region}</h4>
                  <span className={cn(
                    "text-sm font-bold",
                    alert.status === "over" ? "text-destructive" : "text-warning"
                  )}>
                    +{alert.percentage}%
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget:</span>
                    <span className="font-mono">{alert.budget}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Forecast:</span>
                    <span className={cn(
                      "font-mono font-bold",
                      alert.status === "over" ? "text-destructive" : "text-warning"
                    )}>{alert.forecast}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
