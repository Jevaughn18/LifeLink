import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  variant?: "default" | "gold" | "success" | "warning" | "danger";
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel = "vs last month",
  icon: Icon,
  variant = "default",
  className,
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (change === undefined) return null;
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = () => {
    if (change === undefined) return "";
    if (change > 0) return "text-success";
    if (change < 0) return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <div
      className={cn(
        "metric-card",
        variant === "gold" && "metric-card-gold",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
        </div>
        {Icon && (
          <div
            className={cn(
              "h-12 w-12 rounded-xl flex items-center justify-center",
              variant === "gold" && "bg-secondary/20 text-secondary",
              variant === "success" && "bg-success/20 text-success",
              variant === "warning" && "bg-warning/20 text-warning",
              variant === "danger" && "bg-destructive/20 text-destructive",
              variant === "default" && "bg-muted text-muted-foreground"
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
      {change !== undefined && (
        <div className={cn("flex items-center gap-1.5 mt-4 text-sm", getTrendColor())}>
          {getTrendIcon()}
          <span className="font-medium">{Math.abs(change)}%</span>
          <span className="text-muted-foreground">{changeLabel}</span>
        </div>
      )}
    </div>
  );
}
