import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, Users, Activity, AlertTriangle } from "lucide-react";

interface Parish {
  id: string;
  name: string;
  risk: number;
  patients: number;
  topSymptoms: string[];
  ageBreakdown: { group: string; count: number }[];
  trend: number;
}

const parishes: Parish[] = [
  { id: "kingston", name: "Kingston", risk: 72, patients: 1245, topSymptoms: ["Cardiovascular", "Diabetes", "Respiratory"], ageBreakdown: [{ group: "Under 18", count: 120 }, { group: "18-30", count: 280 }, { group: "31-45", count: 340 }, { group: "46-60", count: 320 }, { group: "60+", count: 185 }], trend: 8 },
  { id: "st-andrew", name: "St. Andrew", risk: 58, patients: 1120, topSymptoms: ["Respiratory", "Mental Health", "Cardiovascular"], ageBreakdown: [{ group: "Under 18", count: 110 }, { group: "18-30", count: 260 }, { group: "31-45", count: 320 }, { group: "46-60", count: 280 }, { group: "60+", count: 150 }], trend: 5 },
  { id: "st-catherine", name: "St. Catherine", risk: 45, patients: 890, topSymptoms: ["Diabetes", "Musculoskeletal", "Respiratory"], ageBreakdown: [{ group: "Under 18", count: 95 }, { group: "18-30", count: 210 }, { group: "31-45", count: 260 }, { group: "46-60", count: 220 }, { group: "60+", count: 105 }], trend: -3 },
  { id: "clarendon", name: "Clarendon", risk: 38, patients: 520, topSymptoms: ["Diabetes", "Cardiovascular", "Infectious"], ageBreakdown: [{ group: "Under 18", count: 55 }, { group: "18-30", count: 120 }, { group: "31-45", count: 150 }, { group: "46-60", count: 130 }, { group: "60+", count: 65 }], trend: -1 },
  { id: "manchester", name: "Manchester", risk: 32, patients: 580, topSymptoms: ["Musculoskeletal", "Mental Health", "Respiratory"], ageBreakdown: [{ group: "Under 18", count: 60 }, { group: "18-30", count: 135 }, { group: "31-45", count: 170 }, { group: "46-60", count: 145 }, { group: "60+", count: 70 }], trend: -2 },
  { id: "st-elizabeth", name: "St. Elizabeth", risk: 28, patients: 380, topSymptoms: ["Cardiovascular", "Diabetes", "Mental Health"], ageBreakdown: [{ group: "Under 18", count: 40 }, { group: "18-30", count: 85 }, { group: "31-45", count: 110 }, { group: "46-60", count: 95 }, { group: "60+", count: 50 }], trend: 0 },
  { id: "westmoreland", name: "Westmoreland", risk: 35, patients: 420, topSymptoms: ["Respiratory", "Infectious", "Diabetes"], ageBreakdown: [{ group: "Under 18", count: 45 }, { group: "18-30", count: 100 }, { group: "31-45", count: 125 }, { group: "46-60", count: 105 }, { group: "60+", count: 45 }], trend: 3 },
  { id: "st-james", name: "St. James", risk: 52, patients: 720, topSymptoms: ["Mental Health", "Cardiovascular", "Respiratory"], ageBreakdown: [{ group: "Under 18", count: 75 }, { group: "18-30", count: 170 }, { group: "31-45", count: 210 }, { group: "46-60", count: 180 }, { group: "60+", count: 85 }], trend: 4 },
  { id: "trelawny", name: "Trelawny", risk: 22, patients: 280, topSymptoms: ["Diabetes", "Musculoskeletal", "Cardiovascular"], ageBreakdown: [{ group: "Under 18", count: 30 }, { group: "18-30", count: 65 }, { group: "31-45", count: 80 }, { group: "46-60", count: 70 }, { group: "60+", count: 35 }], trend: -4 },
  { id: "st-ann", name: "St. Ann", risk: 41, patients: 540, topSymptoms: ["Respiratory", "Cardiovascular", "Mental Health"], ageBreakdown: [{ group: "Under 18", count: 55 }, { group: "18-30", count: 125 }, { group: "31-45", count: 160 }, { group: "46-60", count: 135 }, { group: "60+", count: 65 }], trend: 1 },
  { id: "st-mary", name: "St. Mary", risk: 29, patients: 340, topSymptoms: ["Musculoskeletal", "Diabetes", "Respiratory"], ageBreakdown: [{ group: "Under 18", count: 35 }, { group: "18-30", count: 80 }, { group: "31-45", count: 100 }, { group: "46-60", count: 85 }, { group: "60+", count: 40 }], trend: -2 },
  { id: "portland", name: "Portland", risk: 24, patients: 220, topSymptoms: ["Cardiovascular", "Mental Health", "Infectious"], ageBreakdown: [{ group: "Under 18", count: 25 }, { group: "18-30", count: 50 }, { group: "31-45", count: 65 }, { group: "46-60", count: 55 }, { group: "60+", count: 25 }], trend: 0 },
  { id: "st-thomas", name: "St. Thomas", risk: 36, patients: 380, topSymptoms: ["Respiratory", "Diabetes", "Cardiovascular"], ageBreakdown: [{ group: "Under 18", count: 40 }, { group: "18-30", count: 90 }, { group: "31-45", count: 110 }, { group: "46-60", count: 95 }, { group: "60+", count: 45 }], trend: 2 },
  { id: "hanover", name: "Hanover", risk: 19, patients: 180, topSymptoms: ["Mental Health", "Musculoskeletal", "Respiratory"], ageBreakdown: [{ group: "Under 18", count: 20 }, { group: "18-30", count: 40 }, { group: "31-45", count: 55 }, { group: "46-60", count: 45 }, { group: "60+", count: 20 }], trend: -3 },
];

const getRiskColor = (risk: number) => {
  if (risk >= 76) return "from-destructive/60 to-destructive/40";
  if (risk >= 51) return "from-warning/60 to-warning/40";
  if (risk >= 26) return "from-secondary/60 to-secondary/40";
  return "from-success/60 to-success/40";
};

const getRiskBorder = (risk: number) => {
  if (risk >= 76) return "border-destructive/50 hover:border-destructive";
  if (risk >= 51) return "border-warning/50 hover:border-warning";
  if (risk >= 26) return "border-secondary/50 hover:border-secondary";
  return "border-success/50 hover:border-success";
};

const getRiskLabel = (risk: number) => {
  if (risk >= 76) return { text: "Critical", class: "risk-critical" };
  if (risk >= 51) return { text: "High", class: "risk-high" };
  if (risk >= 26) return { text: "Medium", class: "risk-medium" };
  return { text: "Low", class: "risk-low" };
};

export default function RegionalMap() {
  const [selectedParish, setSelectedParish] = useState<Parish | null>(null);
  const [dateRange, setDateRange] = useState("last-30");
  const [ageFilter, setAgeFilter] = useState("all");

  const nationalAverage = parishes.reduce((sum, p) => sum + p.risk, 0) / parishes.length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Regional Health Map</h1>
            <p className="text-muted-foreground">
              Interactive parish-level health risk analysis for Jamaica
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-7">Last 7 days</SelectItem>
                <SelectItem value="last-30">Last 30 days</SelectItem>
                <SelectItem value="last-90">Last 90 days</SelectItem>
                <SelectItem value="last-year">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ageFilter} onValueChange={setAgeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Age group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ages</SelectItem>
                <SelectItem value="under-18">Under 18</SelectItem>
                <SelectItem value="18-30">18-30</SelectItem>
                <SelectItem value="31-45">31-45</SelectItem>
                <SelectItem value="46-60">46-60</SelectItem>
                <SelectItem value="60-plus">60+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 p-4 bg-card rounded-lg border border-border/50">
          <span className="text-sm font-medium text-muted-foreground">Risk Levels:</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-success" />
              <span className="text-sm">Low (0-25%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-secondary" />
              <span className="text-sm">Medium (26-50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-warning" />
              <span className="text-sm">High (51-75%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-destructive" />
              <span className="text-sm">Critical (76-100%)</span>
            </div>
          </div>
          <div className="ml-auto text-sm">
            National Average: <span className="font-mono font-bold text-secondary">{nationalAverage.toFixed(1)}%</span>
          </div>
        </div>

        {/* Map Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {parishes.map((parish) => {
            const riskInfo = getRiskLabel(parish.risk);
            return (
              <button
                key={parish.id}
                onClick={() => setSelectedParish(parish)}
                className={cn(
                  "relative p-4 rounded-xl border-2 transition-all duration-300",
                  "bg-gradient-to-br hover:scale-105 hover:shadow-lg",
                  getRiskColor(parish.risk),
                  getRiskBorder(parish.risk)
                )}
              >
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-sm truncate">{parish.name}</h3>
                  <div className="text-2xl font-bold font-mono">{parish.risk}%</div>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full", riskInfo.class)}>
                    {riskInfo.text}
                  </span>
                  <div className={cn(
                    "flex items-center justify-center gap-1 text-xs",
                    parish.trend > 0 ? "text-destructive" : parish.trend < 0 ? "text-success" : "text-muted-foreground"
                  )}>
                    {parish.trend > 0 ? <TrendingUp className="h-3 w-3" /> : parish.trend < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                    {parish.trend !== 0 && `${Math.abs(parish.trend)}%`}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Parish Modal */}
        <Dialog open={!!selectedParish} onOpenChange={() => setSelectedParish(null)}>
          <DialogContent className="max-w-lg">
            {selectedParish && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <span>{selectedParish.name}</span>
                    <span className={getRiskLabel(selectedParish.risk).class}>
                      {getRiskLabel(selectedParish.risk).text} Risk
                    </span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Users className="h-5 w-5 mx-auto mb-2 text-secondary" />
                      <div className="text-2xl font-bold">{selectedParish.patients.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Total Patients</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Activity className="h-5 w-5 mx-auto mb-2 text-chart-1" />
                      <div className="text-2xl font-bold">{selectedParish.risk}%</div>
                      <div className="text-xs text-muted-foreground">Risk Score</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <AlertTriangle className={cn("h-5 w-5 mx-auto mb-2", selectedParish.trend > 0 ? "text-destructive" : "text-success")} />
                      <div className={cn("text-2xl font-bold", selectedParish.trend > 0 ? "text-destructive" : "text-success")}>
                        {selectedParish.trend > 0 ? "+" : ""}{selectedParish.trend}%
                      </div>
                      <div className="text-xs text-muted-foreground">3-Month Trend</div>
                    </div>
                  </div>

                  {/* Top Symptoms */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Top 3 Symptoms Reported</h4>
                    <div className="flex gap-2">
                      {selectedParish.topSymptoms.map((symptom, i) => (
                        <span key={symptom} className="px-3 py-1 bg-muted rounded-full text-sm">
                          {i + 1}. {symptom}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Age Breakdown */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Age Group Breakdown</h4>
                    <div className="space-y-2">
                      {selectedParish.ageBreakdown.map((group) => (
                        <div key={group.group} className="flex items-center gap-3">
                          <span className="text-sm w-20 text-muted-foreground">{group.group}</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-secondary rounded-full"
                              style={{ width: `${(group.count / selectedParish.patients) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-mono w-16 text-right">{group.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comparison to National */}
                  <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">vs National Average</span>
                      <span className={cn(
                        "font-mono font-bold",
                        selectedParish.risk > nationalAverage ? "text-destructive" : "text-success"
                      )}>
                        {selectedParish.risk > nationalAverage ? "+" : ""}
                        {(selectedParish.risk - nationalAverage).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
