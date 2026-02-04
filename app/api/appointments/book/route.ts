import { NextRequest, NextResponse } from 'next/server';
import { createAppointment } from '@/lib/actions/appointment.actions';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { doctorName, date, reason } = body;

    if (!date) {
      return NextResponse.json(
        { error: 'Appointment date is required' },
        { status: 400 }
      );
    }

    // Create the appointment
    const appointment = await createAppointment({
      patient: user.patientId,
      primaryPhysician: doctorName || 'Any Available Doctor',
      schedule: new Date(date),
      status: 'pending',
      reason: reason || 'General consultation',
      note: 'Booked via voice assistant',
    });

    return NextResponse.json({
      success: true,
      appointment,
      message: `Appointment booked successfully for ${new Date(date).toLocaleString()}`,
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    return NextResponse.json(
      { error: 'Failed to book appointment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
