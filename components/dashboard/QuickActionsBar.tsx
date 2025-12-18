"use client";

import { Plus, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface QuickActionsBarProps {
  userId: string;
  onMessageDoctor?: () => void;
}

export function QuickActionsBar({ userId, onMessageDoctor }: QuickActionsBarProps) {
  const colorStyles = {
    blue: "bg-blue-600 text-white hover:bg-blue-700",
    green: "bg-green-600 text-white hover:bg-green-700",
  };

  return (
    <div className="flex gap-3">
      <Link
        href={`/patients/${userId}/new-appointment`}
        className={cn(
          "flex flex-1 flex-col items-center gap-2 rounded-2xl p-4 transition-all hover:scale-105",
          colorStyles.blue
        )}
      >
        <Plus className="h-5 w-5" />
        <span className="text-sm font-medium">Book Appointment</span>
      </Link>

      <button
        onClick={onMessageDoctor}
        className={cn(
          "flex flex-1 flex-col items-center gap-2 rounded-2xl p-4 transition-all hover:scale-105",
          colorStyles.green
        )}
      >
        <MessageSquare className="h-5 w-5" />
        <span className="text-sm font-medium">Message Doctor</span>
      </button>
    </div>
  );
}
