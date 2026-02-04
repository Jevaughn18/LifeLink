"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { DoctorAvailabilityModal } from "../DoctorAvailabilityModal";
import { deleteDoctorAvailability } from "@/lib/actions/doctor-availability.actions";
import { useRouter } from "next/navigation";
import { Trash2, Edit } from "lucide-react";

export const availabilityColumns: ColumnDef<any>[] = [
  {
    header: "#",
    cell: ({ row }) => {
      return <p className="text-14-medium text-gray-900 dark:text-gray-200">{row.index + 1}</p>;
    },
  },
  {
    accessorKey: "doctorName",
    header: "Doctor",
    cell: ({ row }) => {
      return (
        <p className="text-14-medium text-gray-900 dark:text-gray-200">
          Dr. {row.original.doctorName}
        </p>
      );
    },
  },
  {
    accessorKey: "dayOfWeek",
    header: "Day",
    cell: ({ row }) => {
      return (
        <p className="text-14-regular text-gray-900 dark:text-gray-200">
          {row.original.dayOfWeek}
        </p>
      );
    },
  },
  {
    accessorKey: "startTime",
    header: "Start Time",
    cell: ({ row }) => {
      return (
        <p className="text-14-regular text-gray-900 dark:text-gray-200">
          {row.original.startTime}
        </p>
      );
    },
  },
  {
    accessorKey: "endTime",
    header: "End Time",
    cell: ({ row }) => {
      return (
        <p className="text-14-regular text-gray-900 dark:text-gray-200">{row.original.endTime}</p>
      );
    },
  },
  {
    accessorKey: "slotDurationMinutes",
    header: "Slot Duration",
    cell: ({ row }) => {
      return (
        <p className="text-14-regular text-gray-900 dark:text-gray-200">
          {row.original.slotDurationMinutes} min
        </p>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="pl-4">Actions</div>,
    cell: ({ row }) => {
      const availability = row.original;
      const router = useRouter();

      const handleDelete = async () => {
        if (
          !confirm(
            "Are you sure you want to delete this availability? This will hide it from patients."
          )
        )
          return;

        try {
          await deleteDoctorAvailability(availability.$id);
          router.refresh();
        } catch (error) {
          console.error("Failed to delete:", error);
          alert("Failed to delete availability");
        }
      };

      return (
        <div className="flex gap-2">
          <DoctorAvailabilityModal
            type="edit"
            availability={availability}
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
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
