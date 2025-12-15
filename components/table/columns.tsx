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
      return <p className="text-14-medium ">{row.index + 1}</p>;
    },
  },
  {
    accessorKey: "patient",
    header: "Patient",
    cell: ({ row }) => {
      const appointment = row.original;
      return <p className="text-14-medium ">{appointment.patient.name}</p>;
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
        <p className="text-14-regular min-w-[100px]">
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
            src={doctor?.image!}
            alt="doctor"
            width={100}
            height={100}
            className="size-8"
          />
          <p className="whitespace-nowrap">Dr. {doctor?.name}</p>
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

      // Check if appointment has AI analysis
      if (!appointment.aiSymptomAnalysis) {
        return <p className="text-14-regular text-gray-500">No AI data</p>;
      }

      let aiAnalysis: SymptomAnalysisResult | null = null;
      try {
        aiAnalysis = JSON.parse(appointment.aiSymptomAnalysis);
      } catch (e) {
        return <p className="text-14-regular text-red-500">Error</p>;
      }

      const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
          case "Critical":
            return "bg-red-600";
          case "High":
            return "bg-orange-500";
          case "Medium":
            return "bg-yellow-500";
          case "Low":
            return "bg-green-500";
          default:
            return "bg-gray-500";
        }
      };

      return (
        <>
          <div className="flex flex-col gap-1">
            <Badge className={`${getUrgencyColor(aiAnalysis.urgency_level)} w-fit`}>
              {aiAnalysis.urgency_level}
            </Badge>
            {appointment.aiHumanApproved ? (
              <Badge className="bg-green-600 w-fit">✓ Reviewed</Badge>
            ) : (
              <Button
                size="sm"
                onClick={() => setReviewOpen(true)}
                className="shad-primary-btn text-xs h-7"
              >
                Review
              </Button>
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
          <AppointmentModal
            patientId={appointment.patient.$id}
            userId={appointment.userId}
            appointment={appointment}
            type="schedule"
            title="Schedule Appointment"
            description="Please confirm the following details to schedule."
          />
          <AppointmentModal
            patientId={appointment.patient.$id}
            userId={appointment.userId}
            appointment={appointment}
            type="cancel"
            title="Cancel Appointment"
            description="Are you sure you want to cancel your appointment?"
          />
        </div>
      );
    },
  },
];
