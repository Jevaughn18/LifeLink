"use client";

import { Plus, MessageSquare, Phone, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface QuickAction {
  icon: React.ElementType;
  label: string;
  color: "blue" | "green" | "gray";
  href: string;
}

interface QuickActionsBarProps {
  userId: string;
}

export function QuickActionsBar({ userId }: QuickActionsBarProps) {
  const actions: QuickAction[] = [
    { icon: Plus, label: "Book Appointment", color: "blue", href: `/patients/${userId}/new-appointment` },
    { icon: MessageSquare, label: "Message", color: "green", href: "#" },
    { icon: Phone, label: "Call", color: "gray", href: "#" },
    { icon: Calendar, label: "Schedule", color: "gray", href: "#" },
  ];

  const colorStyles = {
    blue: "bg-blue-600 text-white hover:bg-blue-700",
    green: "bg-green-600 text-white hover:bg-green-700",
    gray: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  };

  return (
    <div className="flex gap-3">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className={cn(
            "flex flex-1 flex-col items-center gap-2 rounded-2xl p-4 transition-all hover:scale-105",
            colorStyles[action.color]
          )}
        >
          <action.icon className="h-5 w-5" />
          <span className="text-sm font-medium">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}
