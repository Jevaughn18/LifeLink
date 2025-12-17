import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AlertTriangle, Flag, Search, Eye, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const anomalies = [
  {
    id: "ANM-001",
    type: "No Appointment History",
    description: "Patient claims high-cost cardiac treatment but LifeLink shows no appointment history",
    claimAmount: 125000,
    patientId: "P-4521",
    severity: "high",
    status: "pending",
    detectedDate: "2024-12-14",
  },
  {
    id: "ANM-002",
    type: "Multiple Claims Same Address",
    description: "3 different patients claiming from same residential address within 30 days",
    claimAmount: 85000,
    patientId: "P-2891, P-2892, P-2893",
    severity: "medium",
    status: "investigating",
    detectedDate: "2024-12-13",
  },
  {
    id: "ANM-003",
    type: "Severity Mismatch",
    description: "Claimed emergency surgery but AI symptom analysis shows only mild symptoms",
    claimAmount: 340000,
    patientId: "P-1205",
    severity: "critical",
    status: "pending",
    detectedDate: "2024-12-12",
  },
  {
    id: "ANM-004",
    type: "Frequency Anomaly",
    description: "Patient filed 12 claims in 3 months vs average of 2 claims per year",
    claimAmount: 95000,
    patientId: "P-3847",
    severity: "medium",
    status: "cleared",
    detectedDate: "2024-12-10",
  },
  {
    id: "ANM-005",
    type: "Provider Pattern",
    description: "Same provider submitting claims for patients with no LifeLink records",
    claimAmount: 520000,
    patientId: "Multiple",
    severity: "critical",
    status: "investigating",
    detectedDate: "2024-12-09",
  },
];

const stats = {
  totalFlags: 127,
  pendingReview: 23,
  investigating: 18,
  confirmed: 42,
  cleared: 44,
  potentialSavings: 2400000,
};

const getSeverityClass = (severity: string) => {
  switch (severity) {
    case "critical": return "bg-destructive/20 text-destructive border-destructive/30";
    case "high": return "bg-warning/20 text-warning border-warning/30";
    case "medium": return "bg-secondary/20 text-secondary border-secondary/30";
    default: return "bg-muted/50 text-muted-foreground";
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "pending": return "bg-warning/20 text-warning";
    case "investigating": return "bg-chart-1/20 text-chart-1";
    case "confirmed": return "bg-destructive/20 text-destructive";
    case "cleared": return "bg-success/20 text-success";
    default: return "bg-muted text-muted-foreground";
  }
};

export default function FraudDetection() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Fraud Detection</h1>
          <p className="text-muted-foreground">
            AI-powered anomaly detection comparing LifeLink data with insurance claims
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="metric-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Flags</p>
            <p className="text-2xl font-bold mt-1">{stats.totalFlags}</p>
          </div>
          <div className="metric-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Pending Review</p>
            <p className="text-2xl font-bold mt-1 text-warning">{stats.pendingReview}</p>
          </div>
          <div className="metric-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Investigating</p>
            <p className="text-2xl font-bold mt-1 text-chart-1">{stats.investigating}</p>
          </div>
          <div className="metric-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Confirmed Fraud</p>
            <p className="text-2xl font-bold mt-1 text-destructive">{stats.confirmed}</p>
          </div>
          <div className="metric-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Cleared</p>
            <p className="text-2xl font-bold mt-1 text-success">{stats.cleared}</p>
          </div>
          <div className="metric-card-gold">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Potential Savings</p>
            <p className="text-2xl font-bold mt-1 text-secondary">${(stats.potentialSavings / 1000000).toFixed(1)}M</p>
          </div>
        </div>

        {/* Red Flags List */}
        <div className="chart-container">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Flag className="h-6 w-6 text-destructive" />
              <h3 className="text-lg font-semibold">Flagged Anomalies</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {anomalies.map((anomaly) => (
              <div
                key={anomaly.id}
                className={cn(
                  "p-4 rounded-lg border transition-colors hover:bg-muted/20",
                  getSeverityClass(anomaly.severity)
                )}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={cn(
                        "h-5 w-5",
                        anomaly.severity === "critical" && "text-destructive",
                        anomaly.severity === "high" && "text-warning",
                        anomaly.severity === "medium" && "text-secondary"
                      )} />
                      <span className="font-mono text-sm text-muted-foreground">{anomaly.id}</span>
                      <Badge variant="outline" className={cn("text-xs", getSeverityClass(anomaly.severity))}>
                        {anomaly.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className={cn("text-xs", getStatusClass(anomaly.status))}>
                        {anomaly.status}
                      </Badge>
                    </div>
                    
                    <h4 className="font-medium">{anomaly.type}</h4>
                    <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <span>
                        <span className="text-muted-foreground">Claim Amount:</span>{" "}
                        <span className="font-mono font-bold">${anomaly.claimAmount.toLocaleString()}</span>
                      </span>
                      <span>
                        <span className="text-muted-foreground">Patient ID:</span>{" "}
                        <span className="font-mono">{anomaly.patientId}</span>
                      </span>
                      <span>
                        <span className="text-muted-foreground">Detected:</span>{" "}
                        <span>{anomaly.detectedDate}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                    {anomaly.status === "pending" && (
                      <>
                        <Button variant="outline" size="sm" className="text-success border-success/30 hover:bg-success/10">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Clear
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                          <XCircle className="h-4 w-4 mr-2" />
                          Flag
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mismatch Summary */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold mb-4">Data Mismatch Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Claims with No LifeLink Record</p>
              <p className="text-3xl font-bold text-destructive mt-2">47</p>
              <p className="text-sm text-muted-foreground mt-1">Total value: $890K</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Severity Mismatches</p>
              <p className="text-3xl font-bold text-warning mt-2">32</p>
              <p className="text-sm text-muted-foreground mt-1">Total value: $1.2M</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Duplicate Pattern Flags</p>
              <p className="text-3xl font-bold text-secondary mt-2">18</p>
              <p className="text-sm text-muted-foreground mt-1">Total value: $310K</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
