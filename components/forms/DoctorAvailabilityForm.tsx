"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Doctors } from "@/constants";
import {
  createDoctorAvailability,
  updateDoctorAvailability,
} from "@/lib/actions/doctor-availability.actions";
import {
  DoctorAvailabilityFormValidation,
  EditDoctorAvailabilityFormValidation,
} from "@/lib/validation";
import { DoctorAvailability } from "@/types/appwrite.types";

import CustomFormField, { FormFieldType } from "../CustomFormField";
import SubmitButton from "../SubmitButton";
import { Form } from "../ui/form";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const SLOT_DURATIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
];

export const DoctorAvailabilityForm = ({
  type = "create",
  availability,
  setOpen,
}: {
  type: "create" | "edit";
  availability?: DoctorAvailability;
  setOpen?: Dispatch<SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const validationSchema =
    type === "create"
      ? DoctorAvailabilityFormValidation
      : EditDoctorAvailabilityFormValidation;

  const form = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
    defaultValues:
      type === "create"
        ? {
            doctorName: "",
            daysOfWeek: [],
            startTime: "09:00",
            endTime: "17:00",
            slotDurationMinutes: 30,
          }
        : {
            doctorName: availability?.doctorName || "",
            dayOfWeek: availability?.dayOfWeek || "Monday",
            startTime: availability?.startTime || "09:00",
            endTime: availability?.endTime || "17:00",
            slotDurationMinutes: availability?.slotDurationMinutes || 30,
          },
  });

  const onSubmit = async (values: z.infer<typeof validationSchema>) => {
    setIsLoading(true);

    try {
      if (type === "create") {
        await createDoctorAvailability({
          doctorName: values.doctorName,
          daysOfWeek: (values as any).daysOfWeek,
          startTime: values.startTime,
          endTime: values.endTime,
          slotDurationMinutes: values.slotDurationMinutes,
        });
      } else {
        await updateDoctorAvailability({
          availabilityId: availability!.$id,
          availability: {
            doctorName: values.doctorName,
            dayOfWeek: (values as any).dayOfWeek,
            startTime: values.startTime,
            endTime: values.endTime,
            slotDurationMinutes: values.slotDurationMinutes,
          },
        });
      }

      setOpen && setOpen(false);
      form.reset();
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "An error occurred");
    }
    setIsLoading(false);
  };

  const labelClass = "text-sm font-semibold text-gray-300 block mb-2";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-6">
        {/* Doctor Selection */}
        <div className="space-y-3">
          <label className={labelClass}>
            Doctor <span className="text-red-500">*</span>
          </label>
          <CustomFormField
            fieldType={FormFieldType.SELECT}
            control={form.control}
            name="doctorName"
            label=""
            placeholder="Select a doctor"
          >
            {Doctors.map((doctor, i) => (
              <SelectItem key={doctor.name + i} value={doctor.name}>
                <div className="flex cursor-pointer items-center gap-3">
                  <p className="text-gray-200">{doctor.name}</p>
                </div>
              </SelectItem>
            ))}
          </CustomFormField>
        </div>

        {/* Days of Week - Multi-select for create, single for edit */}
        {type === "create" ? (
          <div className="space-y-3">
            <label className={labelClass}>
              Days of Week <span className="text-red-500">*</span>
            </label>
            <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600 space-y-3">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="flex items-center gap-3">
                  <Checkbox
                    id={day}
                    checked={(form.watch("daysOfWeek") || []).includes(day)}
                    onCheckedChange={(checked) => {
                      const current = form.watch("daysOfWeek") || [];
                      if (checked) {
                        form.setValue("daysOfWeek", [...current, day]);
                      } else {
                        form.setValue(
                          "daysOfWeek",
                          current.filter((d) => d !== day)
                        );
                      }
                    }}
                    className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <label
                    htmlFor={day}
                    className="text-gray-200 cursor-pointer"
                  >
                    {day}
                  </label>
                </div>
              ))}
            </div>
            {form.formState.errors.daysOfWeek && (
              <p className="text-red-400 text-sm mt-1.5">
                {form.formState.errors.daysOfWeek.message}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <label className={labelClass}>
              Day of Week <span className="text-red-500">*</span>
            </label>
            <CustomFormField
              fieldType={FormFieldType.SELECT}
              control={form.control}
              name="dayOfWeek"
              label=""
              placeholder="Select a day"
            >
              {DAYS_OF_WEEK.map((day) => (
                <SelectItem key={day} value={day}>
                  {day}
                </SelectItem>
              ))}
            </CustomFormField>
          </div>
        )}

        {/* Time Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className={labelClass}>
              Start Time <span className="text-red-500">*</span>
            </label>
            <CustomFormField
              fieldType={FormFieldType.INPUT}
              control={form.control}
              name="startTime"
              label=""
              placeholder="09:00"
            />
          </div>
          <div className="space-y-3">
            <label className={labelClass}>
              End Time <span className="text-red-500">*</span>
            </label>
            <CustomFormField
              fieldType={FormFieldType.INPUT}
              control={form.control}
              name="endTime"
              label=""
              placeholder="17:00"
            />
          </div>
        </div>

        {/* Slot Duration */}
        <div className="space-y-3">
          <label className={labelClass}>
            Appointment Slot Duration <span className="text-red-500">*</span>
          </label>
          <CustomFormField
            fieldType={FormFieldType.SELECT}
            control={form.control}
            name="slotDurationMinutes"
            label=""
            placeholder="Select duration"
          >
            {SLOT_DURATIONS.map((slot) => (
              <SelectItem key={slot.value} value={slot.value.toString()}>
                {slot.label}
              </SelectItem>
            ))}
          </CustomFormField>
        </div>

        <div className="pt-6 border-t border-gray-700">
          <SubmitButton
            isLoading={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold h-14 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {type === "create" ? "Create Availability" : "Update Availability"}
          </SubmitButton>
        </div>
      </form>
    </Form>
  );
};
