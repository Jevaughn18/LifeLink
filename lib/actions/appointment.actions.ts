"use server";

import { query, queryOne, generateId } from "../database/mysql.config";
import { sendAppointmentScheduledEmail, sendAppointmentCancelledEmail } from "../email/appointment-emails";
import { analyzeSymptoms } from "../ai/gemini-service";

// CREATE APPOINTMENT
export const createAppointment = async (appointment: CreateAppointmentParams) => {
  try {
    // Run AI analysis on symptoms if reason is provided
    let aiAnalysis = null;
    if (appointment.reason && appointment.reason.trim().length > 0) {
      try {
        aiAnalysis = await analyzeSymptoms(appointment.reason);
        console.log('AI Symptom Analysis completed:', aiAnalysis);
      } catch (aiError) {
        console.error('AI analysis failed, continuing without it:', aiError);
      }
    }

    const appointmentId = generateId();

    await query(
      `INSERT INTO appointments (
        id, patient_id, primary_physician, schedule, status, reason, note,
        ai_symptom_analysis, ai_human_approved
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        appointmentId,
        appointment.patient,
        appointment.primaryPhysician,
        appointment.schedule,
        appointment.status,
        appointment.reason,
        appointment.note || null,
        aiAnalysis ? JSON.stringify(aiAnalysis) : null,
        false
      ]
    );

    const newAppointment = await queryOne<any>(
      `SELECT a.*,
        p.id as patient_id, p.name as patient_name, p.email as patient_email, p.phone as patient_phone
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       WHERE a.id = ?`,
      [appointmentId]
    );

    return formatAppointmentResponse(newAppointment);
  } catch (error) {
    console.error("An error occurred while creating a new appointment:", error);
    throw error;
  }
};

// GET RECENT APPOINTMENTS
export const getRecentAppointmentList = async () => {
  try {
    const appointments = await query<any>(
      `SELECT a.*,
        p.id as patient_id, p.name as patient_name, p.email as patient_email,
        p.phone as patient_phone, p.insurance_provider
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       ORDER BY a.created_at DESC`
    );

    const counts = appointments.reduce(
      (acc: any, apt: any) => {
        if (apt.status === 'scheduled') acc.scheduledCount++;
        else if (apt.status === 'pending') acc.pendingCount++;
        else if (apt.status === 'cancelled') acc.cancelledCount++;
        return acc;
      },
      { scheduledCount: 0, pendingCount: 0, cancelledCount: 0 }
    );

    return {
      totalCount: appointments.length,
      ...counts,
      documents: appointments.map(formatAppointmentResponse),
    };
  } catch (error) {
    console.error("An error occurred while retrieving the recent appointments:", error);
    throw error;
  }
};

// UPDATE APPOINTMENT
export const updateAppointment = async ({
  appointmentId,
  userId,
  appointment,
  type,
}: UpdateAppointmentParams) => {
  try {
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (appointment.primaryPhysician) {
      updateFields.push('primary_physician = ?');
      updateValues.push(appointment.primaryPhysician);
    }

    if (appointment.schedule) {
      updateFields.push('schedule = ?');
      updateValues.push(appointment.schedule);
    }

    if (appointment.status) {
      updateFields.push('status = ?');
      updateValues.push(appointment.status);
    }

    if (appointment.cancellationReason) {
      updateFields.push('cancellation_reason = ?');
      updateValues.push(appointment.cancellationReason);
    }

    updateValues.push(appointmentId);

    await query(
      `UPDATE appointments SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Get updated appointment
    const updatedAppointment = await queryOne<any>(
      `SELECT a.*,
        p.id as patient_id, p.name as patient_name, p.email as patient_email, p.phone as patient_phone
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       WHERE a.id = ?`,
      [appointmentId]
    );

    // Send email notification based on status
    if (updatedAppointment) {
      const appointmentDate = new Date(updatedAppointment.schedule);
      const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

      if (appointment.status === 'scheduled') {
        // Send scheduled email
        await sendAppointmentScheduledEmail(
          updatedAppointment.patient_email,
          updatedAppointment.patient_name,
          updatedAppointment.primary_physician,
          'General Consultation', // You can extract specialty from doctors table if needed
          formattedDate,
          formattedTime
        );
      } else if (appointment.status === 'cancelled') {
        // Send cancellation email
        await sendAppointmentCancelledEmail(
          updatedAppointment.patient_email,
          updatedAppointment.patient_name,
          updatedAppointment.primary_physician,
          formattedDate,
          formattedTime,
          appointment.cancellationReason || 'No reason provided'
        );
      }
    }

    return formatAppointmentResponse(updatedAppointment);
  } catch (error) {
    console.error("An error occurred while updating an appointment:", error);
    throw error;
  }
};

// GET APPOINTMENT
export const getAppointment = async (appointmentId: string) => {
  try {
    const appointment = await queryOne<any>(
      `SELECT a.*,
        p.id as patient_id, p.name as patient_name, p.email as patient_email, p.phone as patient_phone
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       WHERE a.id = ?`,
      [appointmentId]
    );

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    return formatAppointmentResponse(appointment);
  } catch (error) {
    console.error("An error occurred while retrieving the appointment:", error);
    throw error;
  }
};

// APPROVE AI ANALYSIS (Human-in-the-Loop)
export const approveAIAnalysis = async ({
  appointmentId,
  reviewedBy,
  approved,
  notes,
  updatedAnalysis,
}: {
  appointmentId: string;
  reviewedBy: string;
  approved: boolean;
  notes?: string;
  updatedAnalysis?: SymptomAnalysisResult;
}) => {
  try {
    const updateFields = [
      'ai_human_approved = ?',
      'ai_reviewed_by = ?',
      'ai_reviewed_at = NOW()'
    ];
    const updateValues: any[] = [approved, reviewedBy];

    if (notes) {
      updateFields.push('ai_human_notes = ?');
      updateValues.push(notes);
    }

    if (updatedAnalysis) {
      updateFields.push('ai_symptom_analysis = ?');
      updateValues.push(JSON.stringify(updatedAnalysis));
    }

    updateValues.push(appointmentId);

    await query(
      `UPDATE appointments SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    const updatedAppointment = await getAppointment(appointmentId);
    return updatedAppointment;
  } catch (error) {
    console.error("An error occurred while approving AI analysis:", error);
    throw error;
  }
};

// Helper function to format appointment response
function formatAppointmentResponse(apt: any) {
  if (!apt) return null;

  let parsedAnalysis = null;
  if (apt.ai_symptom_analysis && typeof apt.ai_symptom_analysis === 'string') {
    try {
      // The DB returns a string, so we parse it here.
      parsedAnalysis = JSON.parse(apt.ai_symptom_analysis);
    } catch (e) {
      console.error('Failed to parse ai_symptom_analysis from DB:', apt.ai_symptom_analysis);
      // Leave as null if parsing fails
    }
  } else if (apt.ai_symptom_analysis) {
    // If it's already an object (e.g., from a previous transformation)
    parsedAnalysis = apt.ai_symptom_analysis;
  }

  return {
    $id: apt.id,
    $createdAt: apt.created_at,
    $updatedAt: apt.updated_at,
    patient: {
      $id: apt.patient_id,
      name: apt.patient_name,
      email: apt.patient_email,
      phone: apt.patient_phone,
    },
    primaryPhysician: apt.primary_physician,
    schedule: apt.schedule,
    status: apt.status,
    reason: apt.reason,
    note: apt.note,
    cancellationReason: apt.cancellation_reason,
    aiSymptomAnalysis: parsedAnalysis, // Use the parsed object
    aiReviewedBy: apt.ai_reviewed_by,
    aiReviewedAt: apt.ai_reviewed_at,
    aiHumanApproved: apt.ai_human_approved,
    aiHumanNotes: apt.ai_human_notes,
  };
}

// SEND SMS NOTIFICATION (Placeholder)
export const sendSMSNotification = async (userId: string, content: string) => {
  try {
    // TODO: Implement Twilio SMS
    console.log(`SMS to user ${userId}: ${content}`);
    return { success: true };
  } catch (error) {
    console.error("An error occurred while sending sms:", error);
  }
};
