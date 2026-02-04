import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/mysql.config';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const patientId = user.patientId;

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

    return NextResponse.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}
