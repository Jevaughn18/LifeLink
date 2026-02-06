"use client";

import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Calendar,
  FolderOpen,
  Bell,
  Settings,
  Heart,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  badge?: number;
  onClick?: () => void;
}

function NavItem({ icon: Icon, label, isActive, badge, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
        isActive
          ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm font-semibold"
          : "text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

interface SideNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  patient: any;
  appointmentBadge?: number;
  recordsBadge?: number;
}

export function SideNav({ activeSection, onSectionChange, patient, appointmentBadge, recordsBadge }: SideNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: "overview", icon: LayoutGrid, label: "Overview" },
    { id: "appointments", icon: Calendar, label: "Appointments", badge: appointmentBadge || undefined },
    { id: "records", icon: FolderOpen, label: "Records", badge: recordsBadge || undefined },
    { id: "notifications", icon: Bell, label: "Notifications", badge: 4 },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const handleLogout = async () => {
    try {
      // Call logout API to clear session cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if API call fails
      window.location.href = "/login";
    }
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm lg:hidden"
      >
        {isOpen ? <X className="h-5 w-5 text-gray-900 dark:text-white" /> : <Menu className="h-5 w-5 text-gray-900 dark:text-white" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-72 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-6 transition-all duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="mb-10 flex items-center gap-3">
          <Image
            src="/assets/logo.svg"
            height={40}
            width={120}
            alt="LifeLink"
            className="h-15 w-auto"
          />
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              badge={item.badge}
              isActive={activeSection === item.id}
              onClick={() => onSectionChange(item.id)}
            />
          ))}
        </nav>

        {/* User Card & Logout */}
        <div className="absolute bottom-6 left-6 right-6 space-y-3">
          <div className="rounded-xl bg-gray-100 dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-800 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-full bg-blue-600 flex items-center justify-center shadow-sm">
                <span className="text-lg font-semibold text-white">
                  {patient?.name?.charAt(0) || "P"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900 dark:text-white">{patient?.name || "Patient"}</p>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">{patient?.email || ""}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
