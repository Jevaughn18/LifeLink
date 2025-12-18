import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/mysql.config';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // userId is the patient ID
    const patientId = userId;

    console.log('=== APPOINTMENTS DEBUG ===');
    console.log('Patient ID:', patientId);

    // First check if there are ANY appointments for this patient
    const allAppointments = await query<any>(
      `SELECT id, primary_physician, reason, schedule, status, note, patient_id
       FROM appointments
       WHERE patient_id = ?`,
      [patientId]
    );

    console.log('Total appointments for patient:', allAppointments.length);
    if (allAppointments.length > 0) {
      console.log('First appointment:', allAppointments[0]);
    }

    // Get all appointments (upcoming first, then recent past)
    const appointments = await query<any>(
      `SELECT id, primary_physician, reason, schedule, status, note,
              CASE
                WHEN schedule >= NOW() THEN 'upcoming'
                ELSE 'passed'
              END as appointment_status
       FROM appointments
       WHERE patient_id = ?
       ORDER BY
         CASE WHEN schedule >= NOW() THEN 0 ELSE 1 END,
         schedule ASC
       LIMIT 10`,
      [patientId]
    );

    console.log('Total appointments returned:', appointments.length);
    console.log('=== END DEBUG ===');

    return NextResponse.json({
      success: true,
      appointments,
      debug: {
        patientId,
        totalAppointments: allAppointments.length,
        returnedAppointments: appointments.length,
      }
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}
