"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Appointment } from "@/types/appwrite.types";

import { AppointmentForm } from "./forms/AppointmentForm";

import "react-datepicker/dist/react-datepicker.css";

export const AppointmentModal = ({
  patientId,
  userId,
  appointment,
  type,
}: {
  patientId: string;
  userId: string;
  appointment?: Appointment;
  type: "schedule" | "cancel";
  title: string;
  description: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className={`capitalize ${type === "schedule" 
            ? "text-green-400 hover:text-green-300 hover:bg-green-500/10" 
            : "text-red-400 hover:text-red-300 hover:bg-red-500/10"
          }`}
        >
          {type}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 border-gray-700 sm:max-w-lg">
        <DialogHeader className="mb-6 pb-4 border-b border-gray-700">
          <DialogTitle className="capitalize text-2xl font-bold text-white">
            {type === "schedule" ? "Schedule" : "Cancel"} Appointment
          </DialogTitle>
          <DialogDescription className="text-gray-300 mt-2">
            {type === "schedule" 
              ? "Please fill in the following details to schedule this appointment."
              : "Please provide a reason for cancelling this appointment."
            }
          </DialogDescription>
        </DialogHeader>

        <AppointmentForm
          userId={userId}
          patientId={patientId}
          type={type}
          appointment={appointment}
          setOpen={setOpen}
        />
      </DialogContent>
    </Dialog>
  );
};
