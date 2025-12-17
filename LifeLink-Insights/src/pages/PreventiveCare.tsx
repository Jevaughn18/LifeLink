import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingDown, Heart, DollarSign, MapPin, Megaphone, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const wellnessROI = [
  { category: "Regular Checkups", patients: 2840, outcomes: 85, costSavings: 420000 },
  { category: "Irregular Checkups", patients: 4405, outcomes: 62, costSavings: 180000 },
];

const comparisonData = [
  { metric: "Hospital Admissions", regular: 12, irregular: 28 },
  { metric: "Emergency Visits", regular: 8, irregular: 22 },
  { metric: "Chronic Complications", regular: 15, irregular: 35 },
  { metric: "Treatment Costs (avg)", regular: 850, irregular: 2200 },
];

const campaignRecommendations = [
  {
    id: 1,
    region: "Kingston",
    issue: "High respiratory cases detected",
    recommendation: "Asthma awareness and prevention campaign",
    targetAudience: "All ages, focus on urban areas",
    estimatedImpact: "15-20% reduction in respiratory cases",
    status: "recommended",
  },
  {
    id: 2,
    region: "Spanish Town",
    issue: "Diabetes prevalence 35% above national average",
    recommendation: "Diabetes prevention and lifestyle modification program",
    targetAudience: "Adults 40+",
    estimatedImpact: "25% reduction in new diabetes diagnoses",
    status: "recommended",
  },
  {
    id: 3,
    region: "Clarendon",
    issue: "Mental health cases trending upward",
    recommendation: "Mental wellness awareness initiative",
    targetAudience: "18-45 age group",
    estimatedImpact: "18% improvement in early intervention",
    status: "active",
  },
];

const activeCampaigns = [
  {
    name: "Heart Health Montego Bay",
    region: "St. James",
    startDate: "Oct 2024",
    baseline: 340,
    current: 295,
    reduction: 13.2,
  },
  {
    name: "Diabetes Awareness Portland",
    region: "Portland",
    startDate: "Sep 2024",
    baseline: 180,
    current: 162,
    reduction: 10.0,
  },
];

export default function PreventiveCare() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Preventive Care Insights</h1>
          <p className="text-muted-foreground">
            Wellness program ROI and regional health campaign planning
          </p>
        </div>

        {/* Wellness Program ROI */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="chart-container">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="h-6 w-6 text-destructive" />
              <div>
                <h3 className="text-lg font-semibold">Wellness Program ROI</h3>
                <p className="text-sm text-muted-foreground">Regular vs irregular checkup outcomes</p>
              </div>
            </div>

            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 20%)" />
                  <XAxis type="number" stroke="hsl(215, 15%, 55%)" fontSize={12} />
                  <YAxis type="category" dataKey="metric" stroke="hsl(215, 15%, 55%)" fontSize={11} width={120} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(220, 25%, 13%)",
                      border: "1px solid hsl(220, 20%, 20%)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="regular" name="Regular Checkups" fill="hsl(155, 100%, 40%)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="irregular" name="Irregular Checkups" fill="hsl(0, 84%, 50%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-success" />
                <span className="text-sm text-muted-foreground">Regular Checkups</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive" />
                <span className="text-sm text-muted-foreground">Irregular Checkups</span>
              </div>
            </div>
          </div>

          {/* Cost Savings */}
          <div className="chart-container">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="h-6 w-6 text-success" />
              <div>
                <h3 className="text-lg font-semibold">Cost Savings Analysis</h3>
                <p className="text-sm text-muted-foreground">Early intervention impact</p>
              </div>
            </div>

            <div className="space-y-6">
              {wellnessROI.map((item) => (
                <div key={item.category} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{item.category}</h4>
                    <span className="text-sm text-muted-foreground">{item.patients.toLocaleString()} patients</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Health Outcomes Score</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              item.outcomes >= 80 ? "bg-success" : "bg-warning"
                            )}
                            style={{ width: `${item.outcomes}%` }}
                          />
                        </div>
                        <span className="font-mono text-sm">{item.outcomes}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Est. Cost Savings</p>
                      <p className="text-xl font-bold text-success">
                        ${(item.costSavings / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-success" />
                  <span className="font-medium">Total Annual Savings from Preventive Care</span>
                </div>
                <p className="text-3xl font-bold text-success mt-2">$600,000</p>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Recommendations */}
        <div className="chart-container">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Megaphone className="h-6 w-6 text-secondary" />
              <div>
                <h3 className="text-lg font-semibold">Regional Campaign Planner</h3>
                <p className="text-sm text-muted-foreground">AI-recommended health education campaigns</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {campaignRecommendations.map((campaign) => (
              <div
                key={campaign.id}
                className={cn(
                  "p-4 rounded-lg border",
                  campaign.status === "active" ? "bg-success/10 border-success/30" : "bg-muted/30 border-border/50"
                )}
              >
                {campaign.status === "active" && (
                  <div className="flex items-center gap-2 mb-3 text-success text-sm font-medium">
                    <CheckCircle className="h-4 w-4" />
                    Active Campaign
                  </div>
                )}
                
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{campaign.region}</span>
                </div>

                <div className="p-2 bg-destructive/10 rounded mb-3">
                  <p className="text-xs text-destructive">{campaign.issue}</p>
                </div>

                <h4 className="font-medium text-sm mb-2">{campaign.recommendation}</h4>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <p><span className="font-medium">Target:</span> {campaign.targetAudience}</p>
                  <p><span className="font-medium">Impact:</span> {campaign.estimatedImpact}</p>
                </div>

                {campaign.status === "recommended" && (
                  <Button size="sm" className="w-full mt-4" variant="secondary">
                    Launch Campaign
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Active Campaign Tracking */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold mb-4">Campaign Effectiveness Tracking</h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>Region</th>
                  <th>Start Date</th>
                  <th>Baseline Cases</th>
                  <th>Current Cases</th>
                  <th>Reduction</th>
                </tr>
              </thead>
              <tbody>
                {activeCampaigns.map((campaign) => (
                  <tr key={campaign.name}>
                    <td className="font-medium">{campaign.name}</td>
                    <td>{campaign.region}</td>
                    <td>{campaign.startDate}</td>
                    <td className="font-mono">{campaign.baseline}</td>
                    <td className="font-mono">{campaign.current}</td>
                    <td>
                      <span className="text-success font-bold flex items-center gap-1">
                        <TrendingDown className="h-4 w-4" />
                        {campaign.reduction}%
                      </span>
                    </td>
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
