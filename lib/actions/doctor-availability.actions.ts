"use server";

import { query, queryOne, generateId } from "../database/mysql.config";
import { CreateAvailabilityParams, UpdateAvailabilityParams } from "@/types/appwrite.types";

// Helper function to check for time overlaps
async function checkOverlap(
  doctorName: string,
  dayOfWeek: string,
  startTime: string,
  endTime: string,
  excludeId?: string
): Promise<any | null> {
  let sql = `
    SELECT * FROM doctor_availability
    WHERE doctor_name = ?
      AND day_of_week = ?
      AND is_active = TRUE
      AND (
        (? >= start_time AND ? < end_time)
        OR
        (? > start_time AND ? <= end_time)
        OR
        (? <= start_time AND ? >= end_time)
      )
  `;

  const params: any[] = [
    doctorName,
    dayOfWeek,
    startTime, startTime,
    endTime, endTime,
    startTime, endTime
  ];

  if (excludeId) {
    sql += ` AND id != ?`;
    params.push(excludeId);
  }

  const results = await query<any>(sql, params);
  return results.length > 0 ? results[0] : null;
}

// Format response helper
function formatAvailabilityResponse(record: any) {
  if (!record) return null;

  return {
    $id: record.id,
    $createdAt: record.created_at,
    $updatedAt: record.updated_at,
    doctorName: record.doctor_name,
    dayOfWeek: record.day_of_week,
    startTime: record.start_time,
    endTime: record.end_time,
    slotDurationMinutes: record.slot_duration_minutes,
    isActive: record.is_active,
  };
}

// GET ALL DOCTOR AVAILABILITY
export const getDoctorAvailability = async () => {
  try {
    const availabilities = await query<any>(
      `SELECT * FROM doctor_availability
       WHERE is_active = TRUE
       ORDER BY
         FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
         doctor_name,
         start_time`
    );

    const byDoctor = availabilities.reduce((acc: any, record: any) => {
      if (!acc[record.doctor_name]) {
        acc[record.doctor_name] = [];
      }
      acc[record.doctor_name].push(record);
      return acc;
    }, {});

    return {
      totalRecords: availabilities.length,
      totalDoctors: Object.keys(byDoctor).length,
      documents: availabilities.map(formatAvailabilityResponse).filter((item): item is NonNullable<typeof item> => item !== null),
    };
  } catch (error) {
    console.error("An error occurred while retrieving doctor availability:", error);
    throw error;
  }
};

// CREATE DOCTOR AVAILABILITY (Multi-day support)
export const createDoctorAvailability = async (availability: CreateAvailabilityParams) => {
  try {
    const { doctorName, daysOfWeek, startTime, endTime, slotDurationMinutes } = availability;

    // Validate all days first - check for overlaps
    for (const day of daysOfWeek) {
      const overlap = await checkOverlap(doctorName, day, startTime, endTime);
      if (overlap) {
        throw new Error(
          `Overlap detected: Dr. ${doctorName} already has availability on ${day} from ${overlap.start_time} to ${overlap.end_time}`
        );
      }
    }

    // Create records for each day
    const createdRecords = [];
    for (const day of daysOfWeek) {
      const availabilityId = generateId();

      await query(
        `INSERT INTO doctor_availability (
          id, doctor_name, day_of_week, start_time, end_time,
          slot_duration_minutes, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
        [availabilityId, doctorName, day, startTime, endTime, slotDurationMinutes]
      );

      const newRecord = await queryOne<any>(
        `SELECT * FROM doctor_availability WHERE id = ?`,
        [availabilityId]
      );

      if (newRecord) {
        createdRecords.push(formatAvailabilityResponse(newRecord));
      }
    }

    return createdRecords;
  } catch (error) {
    console.error("An error occurred while creating doctor availability:", error);
    throw error;
  }
};

// UPDATE DOCTOR AVAILABILITY (Single record)
export const updateDoctorAvailability = async ({
  availabilityId,
  availability,
}: UpdateAvailabilityParams) => {
  try {
    const { doctorName, dayOfWeek, startTime, endTime, slotDurationMinutes } = availability;

    // Check for overlap (exclude current record)
    const overlap = await checkOverlap(doctorName, dayOfWeek, startTime, endTime, availabilityId);
    if (overlap) {
      throw new Error(
        `Overlap detected: Dr. ${doctorName} already has availability on ${dayOfWeek} from ${overlap.start_time} to ${overlap.end_time}`
      );
    }

    await query(
      `UPDATE doctor_availability
       SET doctor_name = ?,
           day_of_week = ?,
           start_time = ?,
           end_time = ?,
           slot_duration_minutes = ?
       WHERE id = ?`,
      [doctorName, dayOfWeek, startTime, endTime, slotDurationMinutes, availabilityId]
    );

    const updatedRecord = await queryOne<any>(
      `SELECT * FROM doctor_availability WHERE id = ?`,
      [availabilityId]
    );

    return formatAvailabilityResponse(updatedRecord);
  } catch (error) {
    console.error("An error occurred while updating doctor availability:", error);
    throw error;
  }
};

// SOFT DELETE DOCTOR AVAILABILITY
export const deleteDoctorAvailability = async (availabilityId: string) => {
  try {
    await query(
      `UPDATE doctor_availability SET is_active = FALSE WHERE id = ?`,
      [availabilityId]
    );

    const deletedRecord = await queryOne<any>(
      `SELECT * FROM doctor_availability WHERE id = ?`,
      [availabilityId]
    );

    return formatAvailabilityResponse(deletedRecord);
  } catch (error) {
    console.error("An error occurred while deleting doctor availability:", error);
    throw error;
  }
};
