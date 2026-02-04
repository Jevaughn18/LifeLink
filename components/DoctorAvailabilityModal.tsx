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
import { DoctorAvailability } from "@/types/appwrite.types";

import { DoctorAvailabilityForm } from "./forms/DoctorAvailabilityForm";

export const DoctorAvailabilityModal = ({
  type,
  availability,
  triggerButton,
}: {
  type: "create" | "edit";
  availability?: DoctorAvailability;
  triggerButton?: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            {type === "create" ? "Add Availability" : "Edit"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-gray-800 border-gray-700 sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-6 pb-4 border-b border-gray-700">
          <DialogTitle className="capitalize text-2xl font-bold text-white">
            {type === "create"
              ? "Add Doctor Availability"
              : "Edit Availability"}
          </DialogTitle>
          <DialogDescription className="text-gray-300 mt-2">
            {type === "create"
              ? "Set working hours for one or more days at once."
              : "Update the availability schedule for this time slot."}
          </DialogDescription>
        </DialogHeader>

        <DoctorAvailabilityForm
          type={type}
          availability={availability}
          setOpen={setOpen}
        />
      </DialogContent>
    </Dialog>
  );
};
