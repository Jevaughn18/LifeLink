"use client";

import { Doctors } from "@/constants";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

interface DoctorSelectionCardsProps {
  availableDoctors: string[];
  onSelectDoctor: (doctorName: string) => void;
}

export function DoctorSelectionCards({
  availableDoctors,
  onSelectDoctor,
}: DoctorSelectionCardsProps) {
  return (
    <div className="mt-4 space-y-3">
      <p className="text-sm font-medium text-gray-600">Select a doctor to continue:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Doctors.filter((doc) => availableDoctors.includes(doc.name)).map((doctor) => (
          <button
            key={doctor.name}
            onClick={() => onSelectDoctor(doctor.name)}
            className="group flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 text-left hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="relative h-12 w-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-200 group-hover:ring-blue-400 transition-all">
              <Image
                src={doctor.image}
                alt={doctor.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                Dr. {doctor.name}
              </p>
              <p className="text-sm text-gray-500">Click to select</p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
