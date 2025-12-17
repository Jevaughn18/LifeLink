import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FileText, Download, Calendar, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const availableReports = [
  {
    name: "Executive Summary",
    description: "High-level overview of key metrics and trends",
    lastGenerated: "Dec 15, 2024",
    frequency: "Monthly",
  },
  {
    name: "Regional Health Analysis",
    description: "Parish-by-parish health risk breakdown",
    lastGenerated: "Dec 14, 2024",
    frequency: "Weekly",
  },
  {
    name: "Claims Forecast Report",
    description: "6-month claims prediction and budget analysis",
    lastGenerated: "Dec 10, 2024",
    frequency: "Monthly",
  },
  {
    name: "Fraud Detection Summary",
    description: "Anomaly flags and investigation status",
    lastGenerated: "Dec 15, 2024",
    frequency: "Weekly",
  },
  {
    name: "Product Opportunity Report",
    description: "AI-recommended insurance products by region",
    lastGenerated: "Dec 1, 2024",
    frequency: "Quarterly",
  },
];

const scheduledReports = [
  { name: "Weekly Executive Brief", recipient: "cro@sagicor.com", nextRun: "Dec 22, 2024", status: "active" },
  { name: "Monthly Claims Report", recipient: "underwriting@sagicor.com", nextRun: "Jan 1, 2025", status: "active" },
  { name: "Risk Alert Summary", recipient: "risk-team@sagicor.com", nextRun: "Dec 16, 2024", status: "active" },
];

export default function Reports() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Generate, download, and schedule automated reports
          </p>
        </div>

        {/* Available Reports */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold mb-4">Available Reports</h3>
          <div className="space-y-3">
            {availableReports.map((report) => (
              <div
                key={report.name}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{report.name}</h4>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground">Last generated</p>
                    <p>{report.lastGenerated}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled Reports */}
        <div className="chart-container">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Scheduled Reports</h3>
            <Button variant="secondary" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule New
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report Name</th>
                  <th>Recipient</th>
                  <th>Next Run</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scheduledReports.map((report) => (
                  <tr key={report.name}>
                    <td className="font-medium">{report.name}</td>
                    <td className="font-mono text-sm">{report.recipient}</td>
                    <td>{report.nextRun}</td>
                    <td>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
                        {report.status}
                      </span>
                    </td>
                    <td>
                      <Button variant="ghost" size="sm">Edit</Button>
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
