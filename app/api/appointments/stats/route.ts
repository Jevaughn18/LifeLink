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

    // userId is actually the patient ID in your system
    const patientId = userId;

    // Get total appointments
    const totalResult = await query<any>(
      'SELECT COUNT(*) as count FROM appointments WHERE patient_id = ?',
      [patientId]
    );
    const total = totalResult[0].count;

    // Get completed appointments
    const completedResult = await query<any>(
      'SELECT COUNT(*) as count FROM appointments WHERE patient_id = ? AND status = ?',
      [patientId, 'scheduled']
    );
    const completed = completedResult[0].count;

    // Get pending appointments
    const pendingResult = await query<any>(
      'SELECT COUNT(*) as count FROM appointments WHERE patient_id = ? AND status = ?',
      [patientId, 'pending']
    );
    const pending = pendingResult[0].count;

    // Get next upcoming appointment
    const nextAppointments = await query<any>(
      `SELECT schedule FROM appointments
       WHERE patient_id = ? AND schedule > NOW() AND status IN ('scheduled', 'pending')
       ORDER BY schedule ASC LIMIT 1`,
      [patientId]
    );

    let nextAppointment = null;
    if (nextAppointments.length > 0) {
      const appointmentDate = new Date(nextAppointments[0].schedule);
      const now = new Date();
      const diffTime = appointmentDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        nextAppointment = 'Today';
      } else if (diffDays === 1) {
        nextAppointment = 'Tomorrow';
      } else if (diffDays < 7) {
        nextAppointment = `In ${diffDays} days`;
      } else {
        nextAppointment = appointmentDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
      }
    }

    return NextResponse.json({
      success: true,
      total,
      completed,
      pending,
      nextAppointment,
    });
  } catch (error) {
    console.error('Error fetching appointment stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointment stats' },
      { status: 500 }
    );
  }
}
