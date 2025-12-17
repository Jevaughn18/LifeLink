import { Info } from "lucide-react";

export function AlertsPanel() {
  return (
    <div className="chart-container h-[350px] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Info className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">No Active Alerts</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Alert system not yet configured
          </p>
        </div>
      </div>
    </div>
  );
}
