import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const riskData = [
  { parish: "Kingston", patients: 1245, avgScore: 5.8, highRisk: 22, trend: 3 },
  { parish: "St. Andrew", patients: 1120, avgScore: 5.2, highRisk: 18, trend: 5 },
  { parish: "St. Catherine", patients: 890, avgScore: 4.5, highRisk: 14, trend: -3 },
  { parish: "St. James", patients: 720, avgScore: 4.8, highRisk: 16, trend: 4 },
  { parish: "Manchester", patients: 580, avgScore: 3.9, highRisk: 11, trend: -2 },
  { parish: "St. Ann", patients: 540, avgScore: 4.2, highRisk: 13, trend: 1 },
  { parish: "Clarendon", patients: 520, avgScore: 4.0, highRisk: 12, trend: -1 },
  { parish: "Westmoreland", patients: 420, avgScore: 3.7, highRisk: 10, trend: 3 },
  { parish: "St. Thomas", patients: 380, avgScore: 3.8, highRisk: 11, trend: 2 },
  { parish: "St. Elizabeth", patients: 380, avgScore: 3.5, highRisk: 9, trend: 0 },
  { parish: "St. Mary", patients: 340, avgScore: 3.4, highRisk: 8, trend: -2 },
  { parish: "Trelawny", patients: 280, avgScore: 3.2, highRisk: 7, trend: -4 },
  { parish: "Portland", patients: 220, avgScore: 3.1, highRisk: 6, trend: 0 },
  { parish: "Hanover", patients: 180, avgScore: 2.8, highRisk: 5, trend: -3 },
];

const getRiskScoreClass = (score: number) => {
  if (score >= 7) return "risk-critical";
  if (score >= 5) return "risk-high";
  if (score >= 3) return "risk-medium";
  return "risk-low";
};

const getRiskScoreLabel = (score: number) => {
  if (score >= 9) return "Critical";
  if (score >= 7) return "High";
  if (score >= 4) return "Medium";
  return "Low";
};

export default function RiskScoring() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Risk Scoring Engine</h1>
            <p className="text-muted-foreground">
              AI-powered risk assessment aggregated from LifeLink symptom analysis
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="secondary" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border border-border/50">
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Parishes</SelectItem>
              <SelectItem value="kingston">Kingston</SelectItem>
              <SelectItem value="st-andrew">St. Andrew</SelectItem>
              <SelectItem value="st-catherine">St. Catherine</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Age Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ages</SelectItem>
              <SelectItem value="under-18">Under 18</SelectItem>
              <SelectItem value="18-30">18-30</SelectItem>
              <SelectItem value="31-45">31-45</SelectItem>
              <SelectItem value="46-60">46-60</SelectItem>
              <SelectItem value="60-plus">60+</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              <SelectItem value="sagicor">Sagicor Life</SelectItem>
              <SelectItem value="sagicor-health">Sagicor Health</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Risk Score Legend */}
        <div className="flex items-center gap-6 p-4 bg-card rounded-lg border border-border/50">
          <span className="text-sm font-medium text-muted-foreground">Risk Scores:</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="risk-low">1-3</span>
              <span className="text-sm">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="risk-medium">4-6</span>
              <span className="text-sm">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="risk-high">7-8</span>
              <span className="text-sm">High</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="risk-critical">9-10</span>
              <span className="text-sm">Critical</span>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="chart-container">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Parish</th>
                  <th>Total Patients</th>
                  <th>Avg Risk Score</th>
                  <th>Risk Level</th>
                  <th>High Risk %</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {riskData.map((row) => (
                  <tr key={row.parish} className="hover:bg-muted/30">
                    <td className="font-medium">{row.parish}</td>
                    <td>{row.patients.toLocaleString()}</td>
                    <td>
                      <span className="font-bold">{row.avgScore.toFixed(1)}</span>
                    </td>
                    <td>
                      <span className={getRiskScoreClass(row.avgScore)}>
                        {getRiskScoreLabel(row.avgScore)}
                      </span>
                    </td>
                    <td>{row.highRisk}%</td>
                    <td>
                      <span className={cn(
                        "font-medium",
                        row.trend > 0 ? "text-destructive" : row.trend < 0 ? "text-success" : "text-muted-foreground"
                      )}>
                        {row.trend > 0 ? "↑" : row.trend < 0 ? "↓" : "—"} {Math.abs(row.trend)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="metric-card">
            <p className="text-sm text-muted-foreground">Total Assessed Patients</p>
            <p className="text-3xl font-bold mt-2">7,245</p>
          </div>
          <div className="metric-card">
            <p className="text-sm text-muted-foreground">Average National Risk Score</p>
            <p className="text-3xl font-bold mt-2">4.2</p>
            <span className="risk-medium">Medium</span>
          </div>
          <div className="metric-card">
            <p className="text-sm text-muted-foreground">High-Risk Patients</p>
            <p className="text-3xl font-bold mt-2 text-warning">892</p>
            <p className="text-sm text-muted-foreground">12.3% of total</p>
          </div>
          <div className="metric-card">
            <p className="text-sm text-muted-foreground">Critical Risk Patients</p>
            <p className="text-3xl font-bold mt-2 text-destructive">145</p>
            <p className="text-sm text-muted-foreground">2.0% of total</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
