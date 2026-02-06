"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { useState } from "react";

import { Doctors } from "@/constants";
import { formatDateTime } from "@/lib/utils";
import { Appointment } from "@/types/appwrite.types";

import { AppointmentModal } from "../AppointmentModal";
import { StatusBadge } from "../StatusBadge";
import { AIReviewModal } from "../AIReviewModal";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export const columns: ColumnDef<Appointment>[] = [
  {
    header: "#",
    cell: ({ row }) => {
      return <p className="text-14-medium text-gray-900 dark:text-gray-200">{row.index + 1}</p>;
    },
  },
  {
    accessorKey: "patient",
    header: "Patient",
    cell: ({ row }) => {
      const appointment = row.original;
      return <p className="text-14-medium text-gray-900 dark:text-gray-200">{appointment.patient.name}</p>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <div className="min-w-[115px]">
          <StatusBadge status={appointment.status} />
        </div>
      );
    },
  },
  {
    accessorKey: "schedule",
    header: "Appointment",
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <p className="text-14-regular min-w-[100px] text-gray-900 dark:text-gray-200">
          {formatDateTime(appointment.schedule).dateTime}
        </p>
      );
    },
  },
  {
    accessorKey: "primaryPhysician",
    header: "Doctor",
    cell: ({ row }) => {
      const appointment = row.original;

      const doctor = Doctors.find(
        (doctor) => doctor.name === appointment.primaryPhysician
      );

      return (
        <div className="flex items-center gap-3">
          <Image
            src={doctor?.image || "/assets/images/dr-green.png"}
            alt="doctor"
            width={100}
            height={100}
            className="size-8"
          />
          <p className="whitespace-nowrap text-gray-900 dark:text-gray-200">
            Dr. {doctor?.name || appointment.primaryPhysician}
          </p>
        </div>
      );
    },
  },
  {
    id: "ai-review",
    header: "AI Analysis",
    cell: ({ row }) => {
      const appointment = row.original;
      const [reviewOpen, setReviewOpen] = useState(false);

      // The data from the database is already a parsed object.
      const aiAnalysis = appointment.aiSymptomAnalysis as unknown as SymptomAnalysisResult | null;

      if (!aiAnalysis) {
        return <p className="text-14-regular text-gray-500 dark:text-gray-400">No AI data</p>;
      }

      return (
        <>
          <div className="flex flex-col gap-3 min-w-[180px]">
            <div>
              <p className="text-xs text-gray-400 mb-1.5 font-medium">Symptom Category</p>
              <Badge className="bg-blue-600 hover:bg-blue-700 text-white w-fit px-3 py-1.5 text-xs font-medium">
                {aiAnalysis.symptom_category}
              </Badge>
            </div>
            {appointment.aiReviewedBy ? (
              // Has been reviewed
              <div>
                <p className="text-xs text-gray-400 mb-1.5 font-medium">Review Status</p>
                {appointment.aiHumanApproved ? (
                  <Badge className="bg-green-600 hover:bg-green-700 text-white w-fit px-3 py-1.5 text-xs font-medium">
                    ✓ Approved
                  </Badge>
                ) : (
                  <Badge className="bg-red-600 hover:bg-red-700 text-white w-fit px-3 py-1.5 text-xs font-medium">
                    ✗ Rejected
                  </Badge>
                )}
              </div>
            ) : (
              // Not reviewed yet
              <div>
                <p className="text-xs text-gray-400 mb-1.5 font-medium">Action Required</p>
                <Button
                  size="sm"
                  onClick={() => setReviewOpen(true)}
                  className="bg-green-500 hover:bg-green-600 text-white text-xs h-8 px-4 font-medium"
                >
                  Review
                </Button>
              </div>
            )}
          </div>
          <AIReviewModal
            appointment={appointment}
            open={reviewOpen}
            setOpen={setReviewOpen}
          />
        </>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="pl-4">Actions</div>,
    cell: ({ row }) => {
      const appointment = row.original;

      return (
        <div className="flex gap-1">
          {(appointment.status === "pending" || appointment.status === "cancelled") && (
            <AppointmentModal
              patientId={appointment.patient.$id}
              userId={appointment.userId}
              appointment={appointment}
              type="schedule"
              title="Schedule Appointment"
              description="Please confirm the following details to schedule."
            />
          )}
          {appointment.status === "scheduled" && (
            <AppointmentModal
              patientId={appointment.patient.$id}
              userId={appointment.userId}
              appointment={appointment}
              type="cancel"
              title="Cancel Appointment"
              description="Are you sure you want to cancel your appointment?"
            />
          )}
        </div>
      );
    },
  },
];
