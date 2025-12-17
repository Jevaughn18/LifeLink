import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Target, TrendingUp, Users, DollarSign, Lightbulb, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const opportunities = [
  {
    id: 1,
    region: "Spanish Town",
    finding: "35% higher diabetes cases than national average",
    ageGroup: "46-60 years old",
    recommendation: 'Launch "Diabetes Care Plus" insurance plan',
    marketSize: 2400,
    projectedRevenue: "$1.2M annually",
    confidence: 87,
    priority: "high",
  },
  {
    id: 2,
    region: "Kingston",
    finding: "Mental health cases up 28% in under-30 demographic",
    ageGroup: "18-30 years old",
    recommendation: 'Launch "Mind Wellness" coverage package',
    marketSize: 3200,
    projectedRevenue: "$1.8M annually",
    confidence: 82,
    priority: "high",
  },
  {
    id: 3,
    region: "St. James",
    finding: "Cardiovascular risk 40% above average in 60+ group",
    ageGroup: "60+ years old",
    recommendation: 'Enhanced "Senior Heart Care" plan',
    marketSize: 1800,
    projectedRevenue: "$2.1M annually",
    confidence: 91,
    priority: "critical",
  },
  {
    id: 4,
    region: "St. Catherine",
    finding: "High respiratory cases correlating with occupation data",
    ageGroup: "31-45 years old",
    recommendation: 'Occupational health rider "WorkSafe Respiratory"',
    marketSize: 1500,
    projectedRevenue: "$0.9M annually",
    confidence: 78,
    priority: "medium",
  },
];

const gapAnalysis = [
  { region: "Clarendon", healthNeed: "High", coverage: "Low", gap: 45, opportunity: "$2.1M" },
  { region: "St. Elizabeth", healthNeed: "Medium", coverage: "Very Low", gap: 62, opportunity: "$1.4M" },
  { region: "Portland", healthNeed: "Medium", coverage: "Low", gap: 38, opportunity: "$0.8M" },
  { region: "Hanover", healthNeed: "Low", coverage: "Very Low", gap: 55, opportunity: "$0.5M" },
];

export default function ProductOptimizer() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Insurance Product Optimizer</h1>
          <p className="text-muted-foreground">
            AI-powered recommendations based on LifeLink health trends
          </p>
        </div>

        {/* Opportunity Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className={cn(
                "metric-card relative",
                opp.priority === "critical" && "border-destructive/50",
                opp.priority === "high" && "border-warning/50"
              )}
            >
              {/* Priority Badge */}
              <div className={cn(
                "absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium uppercase",
                opp.priority === "critical" && "bg-destructive/20 text-destructive",
                opp.priority === "high" && "bg-warning/20 text-warning",
                opp.priority === "medium" && "bg-secondary/20 text-secondary"
              )}>
                {opp.priority} priority
              </div>

              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-secondary" />
                <span className="text-sm font-medium text-secondary uppercase tracking-wider">
                  Opportunity Detected
                </span>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Region:</span>
                  <span>{opp.region}</span>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-chart-1 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium">Finding:</span>
                      <p className="text-sm text-muted-foreground">{opp.finding}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Target Age Group:</span>
                  <span>{opp.ageGroup}</span>
                </div>

                <div className="p-3 bg-secondary/10 rounded-lg border border-secondary/30">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-secondary mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-secondary">Recommendation:</span>
                      <p className="text-sm">{opp.recommendation}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground">Market Size</p>
                    <p className="font-bold font-mono">{opp.marketSize.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Projected Revenue</p>
                    <p className="font-bold text-success">{opp.projectedRevenue}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Confidence</p>
                    <p className="font-bold font-mono">{opp.confidence}%</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Gap Analysis */}
        <div className="chart-container">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="h-6 w-6 text-secondary" />
            <div>
              <h3 className="text-lg font-semibold">Product Gap Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Regions with high health needs but low insurance coverage
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Region</th>
                  <th>Health Need Level</th>
                  <th>Current Coverage</th>
                  <th>Coverage Gap</th>
                  <th>Revenue Opportunity</th>
                </tr>
              </thead>
              <tbody>
                {gapAnalysis.map((row) => (
                  <tr key={row.region} className="hover:bg-muted/30">
                    <td className="font-medium">{row.region}</td>
                    <td>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        row.healthNeed === "High" && "bg-destructive/20 text-destructive",
                        row.healthNeed === "Medium" && "bg-warning/20 text-warning",
                        row.healthNeed === "Low" && "bg-success/20 text-success"
                      )}>
                        {row.healthNeed}
                      </span>
                    </td>
                    <td>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        row.coverage === "Very Low" && "bg-destructive/20 text-destructive",
                        row.coverage === "Low" && "bg-warning/20 text-warning"
                      )}>
                        {row.coverage}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-24">
                          <div
                            className="h-full bg-secondary rounded-full"
                            style={{ width: `${row.gap}%` }}
                          />
                        </div>
                        <span className="font-mono text-sm">{row.gap}%</span>
                      </div>
                    </td>
                    <td className="text-success font-bold">{row.opportunity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
