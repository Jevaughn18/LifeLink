"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Edit, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { DoctorAvailabilityModal } from "../DoctorAvailabilityModal";
import { deleteDoctorAvailability } from "@/lib/actions/doctor-availability.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DoctorAvailability } from "@/types/appwrite.types";

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
}

function groupByDoctor(data: DoctorAvailability[]) {
  const map = new Map<string, DoctorAvailability[]>();
  for (const record of data) {
    const existing = map.get(record.doctorName) || [];
    existing.push(record);
    map.set(record.doctorName, existing);
  }
  return Array.from(map.entries()).map(([name, schedules]) => ({ name, schedules }));
}

export function DoctorAvailabilityTable({ data }: { data: DoctorAvailability[] }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const groups = groupByDoctor(data);

  const toggle = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const handleDelete = (id: string) => {
    toast("Remove this time slot?", {
      description: "Patients won't be able to book it.",
      action: {
        label: "Remove",
        onClick: async () => {
          try {
            await deleteDoctorAvailability(id);
            router.refresh();
            toast.success("Time slot removed");
          } catch {
            toast.error("Failed to delete");
          }
        },
      },
    });
  };

  if (groups.length === 0) {
    return (
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
        No doctor availability set up yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {groups.map((group) => {
        const isOpen = expanded.has(group.name);
        return (
          <div
            key={group.name}
            className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden"
          >
            {/* Doctor header — click to expand */}
            <button
              onClick={() => toggle(group.name)}
              className="w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Dr. {group.name}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {group.schedules.length}{" "}
                  {group.schedules.length === 1 ? "schedule" : "schedules"}
                </span>
              </div>

              {/* Day pills summary */}
              <div className="flex flex-wrap gap-1.5 justify-end">
                {group.schedules.map((s) => (
                  <span
                    key={s.$id}
                    className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  >
                    {s.dayOfWeek.slice(0, 3)}
                  </span>
                ))}
              </div>
            </button>

            {/* Expanded schedule rows */}
            {isOpen && (
              <div className="border-t border-gray-200 dark:border-gray-800">
                {group.schedules.map((schedule, i) => (
                  <div
                    key={schedule.$id}
                    className={`flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-gray-800/50 ${
                      i > 0 ? "border-t border-gray-100 dark:border-gray-800" : ""
                    }`}
                  >
                    <div className="flex items-center gap-6 ml-7">
                      <span className="text-sm text-gray-700 dark:text-gray-300 w-24">
                        {schedule.dayOfWeek}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatTime(schedule.startTime)} –{" "}
                        {formatTime(schedule.endTime)}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {schedule.slotDurationMinutes} min slots
                      </span>
                    </div>

                    <div className="flex gap-1">
                      <DoctorAvailabilityModal
                        type="edit"
                        availability={schedule}
                        triggerButton={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(schedule.$id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
