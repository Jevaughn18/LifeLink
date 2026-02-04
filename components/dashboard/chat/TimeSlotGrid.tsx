"use client";

import { useState } from "react";
import { Clock, Calendar, CheckCircle } from "lucide-react";

interface TimeSlot {
  time: string;
  formatted: string;
}

interface TimeSlotGridProps {
  slots: TimeSlot[];
  doctor: string;
  date: string;
  onSelectSlot: (time: string, formatted: string) => void;
}

export function TimeSlotGrid({ slots, doctor, date, onSelectSlot }: TimeSlotGridProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Group slots by time of day
  const groupSlotsByPeriod = (slots: TimeSlot[]) => {
    const morning: TimeSlot[] = [];
    const afternoon: TimeSlot[] = [];
    const evening: TimeSlot[] = [];

    slots.forEach((slot) => {
      const hour = parseInt(slot.time.split(":")[0]);
      if (hour < 12) {
        morning.push(slot);
      } else if (hour < 17) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return { morning, afternoon, evening };
  };

  const { morning, afternoon, evening } = groupSlotsByPeriod(slots);

  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot.time);
    onSelectSlot(slot.time, slot.formatted);
  };

  const renderSlotSection = (title: string, slots: TimeSlot[], icon: React.ReactNode) => {
    if (slots.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          {icon}
          <span>{title}</span>
          <span className="text-gray-400">({slots.length})</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {slots.map((slot) => (
            <button
              key={slot.time}
              onClick={() => handleSelectSlot(slot)}
              className={`group relative p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedSlot === slot.time
                  ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-105"
                  : "bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-400 hover:shadow-md hover:scale-105 active:scale-95"
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className={selectedSlot === slot.time ? "font-bold" : ""}>
                  {slot.formatted}
                </span>
                {selectedSlot === slot.time && (
                  <CheckCircle className="h-4 w-4 animate-in zoom-in duration-200" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (slots.length === 0) {
    return (
      <div className="mt-4 p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-200 flex-shrink-0">
            <Calendar className="h-5 w-5 text-yellow-700" />
          </div>
          <div>
            <p className="font-semibold text-yellow-900">No available slots</p>
            <p className="text-sm text-yellow-700 mt-1">
              Dr. {doctor} has no available time slots on {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
              Please try a different date.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4 p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
          <Calendar className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">Available Time Slots</p>
          <p className="text-sm text-gray-600">
            {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {renderSlotSection("Morning", morning, <Clock className="h-4 w-4 text-orange-500" />)}
        {renderSlotSection("Afternoon", afternoon, <Clock className="h-4 w-4 text-blue-500" />)}
        {renderSlotSection("Evening", evening, <Clock className="h-4 w-4 text-indigo-500" />)}
      </div>

      {selectedSlot && (
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Selected: {slots.find(s => s.time === selectedSlot)?.formatted}
              </p>
              <p className="text-xs text-blue-700">
                Type your reason for the visit to continue
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
