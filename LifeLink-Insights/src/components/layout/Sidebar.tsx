import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  TrendingUp,
  ShieldAlert,
  Package,
  Calculator,
  HeartPulse,
  AlertTriangle,
  Settings,
  FileText,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { path: "/dashboard", label: "Executive Overview", icon: LayoutDashboard },
  { path: "/regional-map", label: "Regional Health Map", icon: Map },
  { path: "/disease-trends", label: "Disease Trends", icon: TrendingUp },
  { path: "/risk-scoring", label: "Risk Scoring", icon: ShieldAlert },
  { path: "/product-optimizer", label: "Product Optimizer", icon: Package },
  { path: "/claims-prediction", label: "Claims Prediction", icon: Calculator },
  { path: "/preventive-care", label: "Preventive Care", icon: HeartPulse },
  { path: "/fraud-detection", label: "Fraud Detection", icon: AlertTriangle },
];

const secondaryItems = [
  { path: "/reports", label: "Reports", icon: FileText },
  { path: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-gold flex items-center justify-center">
              <HeartPulse className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">LifeLink</h1>
              <p className="text-xs text-muted-foreground">Insights Platform</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="h-10 w-10 rounded-lg bg-gradient-gold flex items-center justify-center mx-auto">
            <HeartPulse className="h-6 w-6 text-secondary-foreground" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive
                    ? "bg-sidebar-accent text-secondary border-l-2 border-secondary -ml-0.5 pl-3.5"
                    : "text-sidebar-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-secondary")} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </div>

        {/* Secondary Navigation */}
        <div className="mt-8 pt-4 border-t border-sidebar-border">
          {!collapsed && (
            <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              System
            </p>
          )}
          <div className="space-y-1">
            {secondaryItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive
                      ? "bg-sidebar-accent text-secondary border-l-2 border-secondary -ml-0.5 pl-3.5"
                      : "text-sidebar-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-secondary")} />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Collapse Button */}
      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
