import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, TrendingUp, TrendingDown, Info } from "lucide-react";

const diseaseCategories = [
  { id: "cardiovascular", name: "Cardiovascular", color: "hsl(0, 84%, 50%)" },
  { id: "respiratory", name: "Respiratory", color: "hsl(210, 100%, 50%)" },
  { id: "diabetes", name: "Diabetes/Metabolic", color: "hsl(43, 100%, 55%)" },
  { id: "mental", name: "Mental Health", color: "hsl(280, 70%, 60%)" },
  { id: "infectious", name: "Infectious Diseases", color: "hsl(155, 100%, 40%)" },
  { id: "musculoskeletal", name: "Musculoskeletal", color: "hsl(17, 100%, 60%)" },
];

const trendData = [
  { month: "Jan", cardiovascular: 420, respiratory: 380, diabetes: 320, mental: 280, infectious: 150, musculoskeletal: 180, who_cardio: 400, who_respiratory: 350 },
  { month: "Feb", cardiovascular: 445, respiratory: 410, diabetes: 335, mental: 295, infectious: 180, musculoskeletal: 175, who_cardio: 410, who_respiratory: 360 },
  { month: "Mar", cardiovascular: 480, respiratory: 450, diabetes: 350, mental: 310, infectious: 220, musculoskeletal: 190, who_cardio: 420, who_respiratory: 370 },
  { month: "Apr", cardiovascular: 510, respiratory: 420, diabetes: 365, mental: 340, infectious: 280, musculoskeletal: 185, who_cardio: 430, who_respiratory: 380 },
  { month: "May", cardiovascular: 540, respiratory: 390, diabetes: 380, mental: 360, infectious: 250, musculoskeletal: 200, who_cardio: 440, who_respiratory: 375 },
  { month: "Jun", cardiovascular: 520, respiratory: 360, diabetes: 395, mental: 385, infectious: 190, musculoskeletal: 195, who_cardio: 445, who_respiratory: 365 },
  { month: "Jul", cardiovascular: 550, respiratory: 340, diabetes: 410, mental: 400, infectious: 170, musculoskeletal: 210, who_cardio: 450, who_respiratory: 355 },
  { month: "Aug", cardiovascular: 580, respiratory: 380, diabetes: 425, mental: 420, infectious: 200, musculoskeletal: 205, who_cardio: 455, who_respiratory: 370 },
  { month: "Sep", cardiovascular: 610, respiratory: 420, diabetes: 440, mental: 435, infectious: 240, musculoskeletal: 220, who_cardio: 460, who_respiratory: 385 },
  { month: "Oct", cardiovascular: 640, respiratory: 480, diabetes: 455, mental: 450, infectious: 320, musculoskeletal: 215, who_cardio: 465, who_respiratory: 400 },
  { month: "Nov", cardiovascular: 680, respiratory: 550, diabetes: 470, mental: 465, infectious: 380, musculoskeletal: 230, who_cardio: 470, who_respiratory: 420 },
  { month: "Dec", cardiovascular: 720, respiratory: 620, diabetes: 490, mental: 480, infectious: 420, musculoskeletal: 225, who_cardio: 475, who_respiratory: 440 },
];

const alerts = [
  {
    disease: "Cardiovascular",
    message: "LifeLink data shows 20% higher cardiovascular cases than WHO/PAHO national average",
    severity: "high",
  },
  {
    disease: "Respiratory",
    message: "Respiratory cases 41% above national average - potential outbreak",
    severity: "critical",
  },
  {
    disease: "Infectious Diseases",
    message: "Dengue-related cases trending upward, 180% increase since October",
    severity: "warning",
  },
];

export default function DiseaseTrends() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["cardiovascular", "respiratory"]);
  const [showWHOComparison, setShowWHOComparison] = useState(false);

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Disease Trend Analytics</h1>
          <p className="text-muted-foreground">
            12-month disease trends with WHO/PAHO comparison data
          </p>
        </div>

        {/* Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={cn(
                "p-4 rounded-lg border flex items-start gap-3",
                alert.severity === "critical" && "bg-destructive/10 border-destructive/30",
                alert.severity === "high" && "bg-warning/10 border-warning/30",
                alert.severity === "warning" && "bg-secondary/10 border-secondary/30"
              )}
            >
              <AlertTriangle className={cn(
                "h-5 w-5 flex-shrink-0 mt-0.5",
                alert.severity === "critical" && "text-destructive",
                alert.severity === "high" && "text-warning",
                alert.severity === "warning" && "text-secondary"
              )} />
              <div>
                <h4 className="font-medium text-sm">{alert.disease}</h4>
                <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Category Selector */}
        <div className="chart-container">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {diseaseCategories.map(cat => (
                <Button
                  key={cat.id}
                  variant={selectedCategories.includes(cat.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    selectedCategories.includes(cat.id) && "border-2"
                  )}
                  style={{
                    borderColor: selectedCategories.includes(cat.id) ? cat.color : undefined,
                    backgroundColor: selectedCategories.includes(cat.id) ? `${cat.color}20` : undefined,
                  }}
                >
                  <div
                    className="h-3 w-3 rounded-full mr-2"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                </Button>
              ))}
            </div>
            <Button
              variant={showWHOComparison ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowWHOComparison(!showWHOComparison)}
            >
              <Info className="h-4 w-4 mr-2" />
              {showWHOComparison ? "Hide" : "Show"} WHO/PAHO Comparison
            </Button>
          </div>

          {/* Chart */}
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 20%)" />
                <XAxis
                  dataKey="month"
                  stroke="hsl(215, 15%, 55%)"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="hsl(215, 15%, 55%)"
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(220, 25%, 13%)",
                    border: "1px solid hsl(220, 20%, 20%)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "hsl(210, 20%, 95%)" }}
                />
                <Legend />
                {diseaseCategories
                  .filter(cat => selectedCategories.includes(cat.id))
                  .map(cat => (
                    <Line
                      key={cat.id}
                      type="monotone"
                      dataKey={cat.id}
                      stroke={cat.color}
                      strokeWidth={2}
                      dot={false}
                      name={`LifeLink - ${cat.name}`}
                    />
                  ))}
                {showWHOComparison && selectedCategories.includes("cardiovascular") && (
                  <Line
                    type="monotone"
                    dataKey="who_cardio"
                    stroke="hsl(0, 84%, 50%)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="WHO - Cardiovascular"
                  />
                )}
                {showWHOComparison && selectedCategories.includes("respiratory") && (
                  <Line
                    type="monotone"
                    dataKey="who_respiratory"
                    stroke="hsl(210, 100%, 50%)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="WHO - Respiratory"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {diseaseCategories.slice(0, 4).map(cat => {
            const latestValue = trendData[trendData.length - 1][cat.id as keyof typeof trendData[0]] as number;
            const previousValue = trendData[trendData.length - 2][cat.id as keyof typeof trendData[0]] as number;
            const change = ((latestValue - previousValue) / previousValue) * 100;
            
            return (
              <div key={cat.id} className="metric-card">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-sm text-muted-foreground">{cat.name}</span>
                </div>
                <div className="text-2xl font-bold font-mono">{latestValue}</div>
                <div className={cn(
                  "flex items-center gap-1 text-sm mt-2",
                  change > 0 ? "text-destructive" : "text-success"
                )}>
                  {change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{Math.abs(change).toFixed(1)}% from last month</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
