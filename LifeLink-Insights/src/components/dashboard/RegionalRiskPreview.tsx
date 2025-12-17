import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useHealthInsights, transformParishData } from "@/hooks/use-health-insights";

const getRiskLevel = (risk: number) => {
  if (risk >= 76) return { label: "Critical", color: "bg-destructive", textColor: "text-destructive" };
  if (risk >= 51) return { label: "High", color: "bg-warning", textColor: "text-warning" };
  if (risk >= 26) return { label: "Medium", color: "bg-secondary", textColor: "text-secondary" };
  return { label: "Low", color: "bg-success", textColor: "text-success" };
};

export function RegionalRiskPreview() {
  const { data: apiData, isLoading, error } = useHealthInsights();
  const parishData = transformParishData(apiData);

  if (isLoading) {
    return (
      <div className="chart-container h-[350px] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading regional data...</p>
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

  if (!parishData || parishData.length === 0) {
    return (
      <div className="chart-container h-[350px] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No regional data available</p>
      </div>
    );
  }

  const sortedParishes = parishData.slice(0, 6);

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Regional Health Risks</h3>
          <p className="text-sm text-muted-foreground">Top risk parishes in Jamaica</p>
        </div>
        <Link to="/regional-map">
          <Button variant="ghost" size="sm" className="text-secondary hover:text-secondary/80">
            View Map <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="space-y-4">
        {sortedParishes.map((parish) => {
          const riskInfo = getRiskLevel(parish.highRiskPercent);
          return (
            <div key={parish.parish} className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate">{parish.parish}</span>
                  <span className={cn("text-sm font-mono", riskInfo.textColor)}>
                    {parish.highRiskPercent}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", riskInfo.color)}
                    style={{ width: `${parish.highRiskPercent}%` }}
                  />
                </div>
              </div>
              <span
                className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium",
                  parish.highRiskPercent >= 76 && "risk-critical",
                  parish.highRiskPercent >= 51 && parish.highRiskPercent < 76 && "risk-high",
                  parish.highRiskPercent >= 26 && parish.highRiskPercent < 51 && "risk-medium",
                  parish.highRiskPercent < 26 && "risk-low"
                )}
              >
                {parish.riskLevel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
