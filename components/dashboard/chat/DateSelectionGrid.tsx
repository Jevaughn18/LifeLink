"use client";

import { useState } from "react";
import { Calendar, CheckCircle } from "lucide-react";

interface AvailableDate {
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  availableSlots: number;
}

interface DateSelectionGridProps {
  dates: AvailableDate[];
  doctor: string;
  onSelectDate: (date: string) => void;
}

export function DateSelectionGrid({ dates, doctor, onSelectDate }: DateSelectionGridProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleSelectDate = (date: AvailableDate) => {
    setSelectedDate(date.date);
    onSelectDate(date.date);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      day: date.getDate(),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' })
    };
  };

  if (dates.length === 0) {
    return (
      <div className="mt-4 p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-200 flex-shrink-0">
            <Calendar className="h-5 w-5 text-yellow-700" />
          </div>
          <div>
            <p className="font-semibold text-yellow-900">No available dates</p>
            <p className="text-sm text-yellow-700 mt-1">
              Dr. {doctor} has no availability in the next 30 days. Please try another doctor.
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
          <p className="font-semibold text-gray-900">Available Dates</p>
          <p className="text-sm text-gray-600">
            Select a date to see available time slots
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {dates.map((dateItem) => {
          const { month, day, weekday } = formatDate(dateItem.date);
          return (
            <button
              key={dateItem.date}
              onClick={() => handleSelectDate(dateItem)}
              className={`group relative p-4 rounded-xl text-center transition-all duration-200 ${
                selectedDate === dateItem.date
                  ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-105"
                  : "bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-400 hover:shadow-md hover:scale-105 active:scale-95"
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className={`text-xs font-medium uppercase ${
                  selectedDate === dateItem.date ? "text-blue-100" : "text-gray-500"
                }`}>
                  {weekday}
                </span>
                <span className={`text-2xl font-bold ${
                  selectedDate === dateItem.date ? "text-white" : "text-gray-900"
                }`}>
                  {day}
                </span>
                <span className={`text-xs font-medium ${
                  selectedDate === dateItem.date ? "text-blue-100" : "text-gray-600"
                }`}>
                  {month}
                </span>
                <span className={`text-xs mt-1 ${
                  selectedDate === dateItem.date ? "text-blue-200" : "text-blue-600"
                }`}>
                  {dateItem.availableSlots} slots
                </span>
                {selectedDate === dateItem.date && (
                  <CheckCircle className="h-4 w-4 mt-1 animate-in zoom-in duration-200" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Selected: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-xs text-blue-700">
                Loading available time slots...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
