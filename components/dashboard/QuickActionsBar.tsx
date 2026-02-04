"use client";

import { Plus, MessageSquare, Mic } from "lucide-react";
import Link from "next/link";

interface QuickActionsBarProps {
  userId: string;
  onMessageDoctor?: () => void;
  onVoiceAssistant?: () => void;
}

export function QuickActionsBar({ userId, onMessageDoctor, onVoiceAssistant }: QuickActionsBarProps) {

  return (
    <div className="flex gap-3">
      <Link
        href={`/patients/${userId}/new-appointment`}
        className="flex flex-1 flex-col items-center gap-2 rounded-2xl p-4 bg-blue-600 text-white hover:bg-blue-700 transition-all hover:scale-105 shadow-sm"
      >
        <Plus className="h-5 w-5" />
        <span className="text-sm font-medium">Book Appointment</span>
      </Link>

      <button
        onClick={onVoiceAssistant}
        className="flex flex-1 flex-col items-center gap-2 rounded-2xl p-4 bg-gradient-to-br from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all hover:scale-105 shadow-sm"
      >
        <Mic className="h-5 w-5" />
        <span className="text-sm font-medium">Voice Assistant</span>
      </button>

      <button
        onClick={onMessageDoctor}
        className="flex flex-1 flex-col items-center gap-2 rounded-2xl p-4 bg-blue-600 text-white hover:bg-blue-700 transition-all hover:scale-105 shadow-sm"
      >
        <MessageSquare className="h-5 w-5" />
        <span className="text-sm font-medium">Message Doctor</span>
      </button>
    </div>
  );
}
