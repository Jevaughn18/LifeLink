import { NextResponse } from 'next/server';
import { createAppointment } from '@/lib/actions/appointment.actions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, doctorName, date, reason } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: 'Appointment date is required' },
        { status: 400 }
      );
    }

    // Create the appointment
    const appointment = await createAppointment({
      patient: userId,
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
