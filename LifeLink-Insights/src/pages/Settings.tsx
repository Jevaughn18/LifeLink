import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { User, Bell, Shield, Database, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and platform preferences
          </p>
        </div>

        {/* Profile Settings */}
        <div className="chart-container">
          <div className="flex items-center gap-3 mb-6">
            <User className="h-5 w-5 text-secondary" />
            <h3 className="text-lg font-semibold">Profile Settings</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input defaultValue="John Smith" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input defaultValue="john.smith@sagicor.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Input defaultValue="Chief Risk Officer" disabled />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Input defaultValue="Risk Management" />
            </div>
          </div>
          <Button className="mt-4" variant="secondary">Save Changes</Button>
        </div>

        {/* Notification Settings */}
        <div className="chart-container">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="h-5 w-5 text-secondary" />
            <h3 className="text-lg font-semibold">Notification Preferences</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Critical Health Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified about urgent health trends</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weekly Summary Email</p>
                <p className="text-sm text-muted-foreground">Receive weekly executive summary</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Fraud Detection Alerts</p>
                <p className="text-sm text-muted-foreground">Immediate notification for high-severity flags</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Report Ready Notifications</p>
                <p className="text-sm text-muted-foreground">Get notified when scheduled reports are ready</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* Data Settings */}
        <div className="chart-container">
          <div className="flex items-center gap-3 mb-6">
            <Database className="h-5 w-5 text-secondary" />
            <h3 className="text-lg font-semibold">Data Settings</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-refresh Dashboard</p>
                <p className="text-sm text-muted-foreground">Refresh data every 5 minutes</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Include WHO/PAHO Comparison</p>
                <p className="text-sm text-muted-foreground">Show national health data comparisons</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {/* API Access */}
        <div className="chart-container">
          <div className="flex items-center gap-3 mb-6">
            <Key className="h-5 w-5 text-secondary" />
            <h3 className="text-lg font-semibold">API Access</h3>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Your API Key</p>
            <div className="flex items-center gap-2">
              <Input type="password" defaultValue="sk_live_xxxxxxxxxxxxxxxx" readOnly className="font-mono" />
              <Button variant="outline">Copy</Button>
              <Button variant="outline">Regenerate</Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
