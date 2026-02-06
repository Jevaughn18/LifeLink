"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { SelectItem } from "@/components/ui/select";
import { Doctors } from "@/constants";
import {
  createAppointment,
  updateAppointment,
} from "@/lib/actions/appointment.actions";
import { getAppointmentSchema } from "@/lib/validation";
import { Appointment } from "@/types/appwrite.types";

import "react-datepicker/dist/react-datepicker.css";

import CustomFormField, { FormFieldType } from "../CustomFormField";
import SubmitButton from "../SubmitButton";
import { Form } from "../ui/form";

interface TimeSlot {
  time: string;
  formatted: string;
}

export const AppointmentForm = ({
  userId,
  patientId,
  type = "create",
  appointment,
  setOpen,
}: {
  userId: string;
  patientId: string;
  type: "create" | "schedule" | "cancel";
  appointment?: Appointment;
  setOpen?: Dispatch<SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const AppointmentFormValidation = getAppointmentSchema(type);

  const form = useForm<z.infer<typeof AppointmentFormValidation>>({
    resolver: zodResolver(AppointmentFormValidation),
    defaultValues: {
      primaryPhysician: appointment ? appointment?.primaryPhysician : "",
      schedule: appointment
        ? new Date(appointment?.schedule!)
        : new Date(Date.now()),
      reason: appointment ? appointment.reason : "",
      note: appointment?.note || "",
      cancellationReason: appointment?.cancellationReason || "",
    },
  });

  // Watch for doctor and schedule changes to fetch available slots
  const watchedDoctor = form.watch("primaryPhysician");
  const watchedSchedule = form.watch("schedule");

  useEffect(() => {
    // Only fetch slots for "create" type (patient booking)
    if (type !== "create") return;

    // Need both doctor and date to fetch slots
    if (!watchedDoctor || !watchedSchedule) {
      setAvailableSlots([]);
      return;
    }

    const fetchAvailableSlots = async () => {
      setLoadingSlots(true);
      try {
        const dateString = new Date(watchedSchedule).toISOString().split('T')[0];
        const response = await fetch(
          `/api/appointments/available-slots?doctor=${encodeURIComponent(watchedDoctor)}&date=${dateString}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch available slots');
        }

        const data = await response.json();

        if (data.success) {
          setAvailableSlots(data.slots || []);
          setSelectedDate(new Date(watchedSchedule));
          // Reset selected slot when date or doctor changes
          setSelectedSlot("");
        }
      } catch (error) {
        console.error('Error fetching slots:', error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [watchedDoctor, watchedSchedule, type]);

  const onSubmit = async (
    values: z.infer<typeof AppointmentFormValidation>
  ) => {
    setIsLoading(true);

    let status;
    switch (type) {
      case "schedule":
        status = "scheduled";
        break;
      case "cancel":
        status = "cancelled";
        break;
      default:
        status = "pending";
    }

    try {
      console.log("Form submission:", { type, patientId, userId });

      if (type === "create" && patientId) {
        // Validate that a time slot is selected
        if (!selectedSlot) {
          alert('Please select a time slot for your appointment');
          setIsLoading(false);
          return;
        }

        // For patient booking, combine selected date with selected time slot
        let scheduleDateTime = new Date(values.schedule);

        if (selectedSlot && selectedDate) {
          // Parse the selected time slot (format: "HH:MM")
          const [hours, minutes] = selectedSlot.split(':').map(Number);
          scheduleDateTime = new Date(selectedDate);
          scheduleDateTime.setHours(hours, minutes, 0, 0);
        }

        const appointment = {
          userId,
          patient: patientId,
          primaryPhysician: values.primaryPhysician,
          schedule: scheduleDateTime,
          reason: values.reason || "",
          status: status as Status,
          note: values.note || "",
        };

        console.log("Creating appointment:", appointment);
        const newAppointment = await createAppointment(appointment);

        if (newAppointment) {
          form.reset();
          router.push(
            `/new-appointment/success?appointmentId=${newAppointment.$id}`
          );
        }
      } else {
        const appointmentToUpdate = {
          userId,
          appointmentId: appointment?.$id!,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          appointment: {
            primaryPhysician: values.primaryPhysician,
            schedule: new Date(values.schedule),
            status: status as Status,
            cancellationReason: values.cancellationReason,
          },
          type,
        };

        const updatedAppointment = await updateAppointment(appointmentToUpdate);

        if (updatedAppointment) {
          setOpen && setOpen(false);
          form.reset();
          router.refresh();
        }
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  let buttonLabel;
  switch (type) {
    case "cancel":
      buttonLabel = "Cancel Appointment";
      break;
    case "schedule":
      buttonLabel = "Schedule Appointment";
      break;
    default:
      buttonLabel = "Submit Apppointment";
  }

  // Determine if we're in a light or dark context
  const isLightMode = type === "create";
  const labelClass = isLightMode
    ? "text-sm font-semibold text-gray-700 block mb-2"
    : "text-sm font-semibold text-gray-300 block mb-2";

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex-1 space-y-8"
        data-light-mode={type === "create" ? "true" : "false"}
      >
        {type !== "cancel" && (
          <>
            {/* Doctor Selection */}
            <div className="space-y-3">
              <label className={labelClass}>
                Select Doctor <span className="text-red-500">*</span>
              </label>
              <CustomFormField
                fieldType={FormFieldType.SELECT}
                control={form.control}
                name="primaryPhysician"
                label=""
                placeholder="Choose your preferred doctor"
              >
                {Doctors.map((doctor, i) => (
                  <SelectItem key={doctor.name + i} value={doctor.name}>
                    <div className="flex cursor-pointer items-center gap-3">
                      <Image
                        src={doctor.image}
                        width={40}
                        height={40}
                        alt="doctor"
                        className={`rounded-full border-2 ${isLightMode ? "border-gray-200" : "border-gray-600"}`}
                      />
                      <p
                        className={
                          isLightMode
                            ? "text-gray-900 font-medium"
                            : "text-gray-200"
                        }
                      >
                        {doctor.name}
                      </p>
                    </div>
                  </SelectItem>
                ))}
              </CustomFormField>
            </div>

            {/* Date Selection */}
            <div className="space-y-3">
              <label className={labelClass}>
                Appointment Date <span className="text-red-500">*</span>
              </label>
              <CustomFormField
                fieldType={FormFieldType.DATE_PICKER}
                control={form.control}
                name="schedule"
                label=""
                showTimeSelect={false}
                dateFormat="MM/dd/yyyy"
              />
            </div>

            {/* Time Slot Selection - Only for patient booking */}
            {type === "create" && watchedDoctor && watchedSchedule && (
              <div className="space-y-3">
                <label className={labelClass}>
                  Select Time Slot <span className="text-red-500">*</span>
                </label>

                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8 bg-gray-50 rounded-xl">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                    <p className="text-yellow-800 font-medium">
                      No available slots for this date
                    </p>
                    <p className="text-yellow-600 text-sm mt-1">
                      Please select a different date
                    </p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    {/* Morning Slots */}
                    {availableSlots.filter(slot => {
                      const hour = parseInt(slot.time.split(':')[0]);
                      return hour < 12;
                    }).length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
                          Morning
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {availableSlots
                            .filter(slot => {
                              const hour = parseInt(slot.time.split(':')[0]);
                              return hour < 12;
                            })
                            .map((slot) => (
                              <button
                                key={slot.time}
                                type="button"
                                onClick={() => setSelectedSlot(slot.time)}
                                className={`px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all ${
                                  selectedSlot === slot.time
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                                }`}
                              >
                                {slot.formatted}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Afternoon/Evening Slots */}
                    {availableSlots.filter(slot => {
                      const hour = parseInt(slot.time.split(':')[0]);
                      return hour >= 12;
                    }).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
                          Afternoon / Evening
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {availableSlots
                            .filter(slot => {
                              const hour = parseInt(slot.time.split(':')[0]);
                              return hour >= 12;
                            })
                            .map((slot) => (
                              <button
                                key={slot.time}
                                type="button"
                                onClick={() => setSelectedSlot(slot.time)}
                                className={`px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all ${
                                  selectedSlot === slot.time
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                                }`}
                              >
                                {slot.formatted}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Selected slot display */}
                {selectedSlot && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <p className="text-sm text-blue-700">
                      Selected:{" "}
                      <span className="font-semibold">
                        {availableSlots.find(s => s.time === selectedSlot)?.formatted}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {type === "schedule" && (
              <div
                className={`${isLightMode ? "bg-blue-50 border-blue-200" : "bg-gray-700/50 border-gray-600"} p-5 rounded-xl border`}
              >
                <p
                  className={`text-sm font-medium ${isLightMode ? "text-blue-700" : "text-gray-400"} mb-2`}
                >
                  Appointment Reason
                </p>
                <p
                  className={
                    isLightMode
                      ? "text-gray-900 text-base"
                      : "text-gray-200 text-base"
                  }
                >
                  {appointment?.reason || "N/A"}
                </p>
              </div>
            )}

            {type === "create" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className={labelClass}>
                    Appointment Reason <span className="text-red-500">*</span>
                  </label>
                  <CustomFormField
                    fieldType={FormFieldType.TEXTAREA}
                    control={form.control}
                    name="reason"
                    label=""
                    placeholder="e.g., Annual check-up, Follow-up consultation, etc."
                  />
                </div>

                <div className="space-y-3">
                  <label className={labelClass}>
                    Additional Notes{" "}
                    <span className="text-gray-400 text-xs font-normal">
                      (Optional)
                    </span>
                  </label>
                  <CustomFormField
                    fieldType={FormFieldType.TEXTAREA}
                    control={form.control}
                    name="note"
                    label=""
                    placeholder="Any special requests or preferences..."
                  />
                </div>
              </div>
            )}
          </>
        )}

        {type === "cancel" && (
          <div className="space-y-3">
            <label className={labelClass}>
              Reason for Cancellation <span className="text-red-500">*</span>
            </label>
            <CustomFormField
              fieldType={FormFieldType.TEXTAREA}
              control={form.control}
              name="cancellationReason"
              label=""
              placeholder="Please provide a reason for cancelling this appointment..."
            />
          </div>
        )}

        <div className="pt-6 border-t border-gray-200">
          {type === "create" && watchedDoctor && watchedSchedule && !selectedSlot && availableSlots.length > 0 && (
            <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
              <p className="text-sm text-yellow-800">
                Please select a time slot to continue
              </p>
            </div>
          )}
          <SubmitButton
            isLoading={isLoading}
            className={
              type === "cancel"
                ? "w-full bg-red-600 hover:bg-red-700 text-white font-semibold h-14 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-base"
                : "w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold h-14 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-base"
            }
          >
            {buttonLabel}
          </SubmitButton>
        </div>
      </form>
    </Form>
  );
};
