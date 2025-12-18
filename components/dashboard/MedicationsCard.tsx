"use client";

import { Check, Clock, Pill } from "lucide-react";
import { cn } from "@/lib/utils";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  schedule: string;
  taken: boolean;
}

interface MedicationsCardProps {
  patient?: any;
}

export function MedicationsCard({ patient }: MedicationsCardProps) {
  // TODO: Get from patient.current_medication field
  const medications: Medication[] = [
    { id: "1", name: "Vitamin D3", dosage: "2000 IU", schedule: "Morning", taken: true },
    { id: "2", name: "Omega-3", dosage: "1000mg", schedule: "Morning", taken: true },
    { id: "3", name: "Magnesium", dosage: "400mg", schedule: "Evening", taken: false },
  ];

  const takenCount = medications.filter((m) => m.taken).length;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
            <Pill className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Today's Medications</h3>
            <p className="text-sm text-gray-500">
              {takenCount} of {medications.length} taken
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {medications.map((med) => (
          <div
            key={med.id}
            className={cn(
              "flex items-center justify-between rounded-xl p-3 transition-colors",
              med.taken ? "bg-green-50" : "bg-gray-50"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  med.taken ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-500"
                )}
              >
                {med.taken ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
              </div>
              <div>
                <p className={cn("text-sm font-medium", med.taken && "text-green-700")}>
                  {med.name}
                </p>
                <p className="text-xs text-gray-500">
                  {med.dosage} · {med.schedule}
                </p>
              </div>
            </div>
            {!med.taken && (
              <button className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition-transform hover:scale-105">
                Take
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
