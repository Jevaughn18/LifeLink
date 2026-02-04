import { NextRequest, NextResponse } from 'next/server';
import { StreamClient } from '@stream-io/node-sdk';
import { query, generateId } from '@/lib/database/mysql.config';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Find a doctor whose scheduled hours cover right now
    const now = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[now.getDay()];
    const currentTime = now.toTimeString().slice(0, 8); // HH:MM:SS

    const doctors = await query<any>(
      `SELECT DISTINCT doctor_name
       FROM doctor_availability
       WHERE day_of_week = ?
         AND start_time <= ?
         AND end_time > ?
         AND is_active = TRUE`,
      [dayOfWeek, currentTime, currentTime]
    );

    if (doctors.length === 0) {
      return NextResponse.json({ error: 'No doctors available' }, { status: 503 });
    }

    const doctorName = doctors[0].doctor_name;
    const meetingId = generateId();

    // Create the Stream video call server-side so it exists before anyone navigates to it
    const streamClient = new StreamClient(
      process.env.NEXT_PUBLIC_STREAM_API_KEY!,
      process.env.STREAM_SECRET_KEY!
    );
    const call = streamClient.video.call('default', meetingId);
    await call.getOrCreate({
      data: {
        created_by_id: user.patientId,
        starts_at: new Date().toISOString(),
        custom: {
          description: `Instant consult with Dr. ${doctorName}`,
          patientName: user.name,
        },
      },
    });

    // Persist so the admin dashboard can pick it up
    await query(
      `INSERT INTO instant_consults (id, patient_name, doctor_name, meeting_id, status)
       VALUES (?, ?, ?, ?, 'waiting')`,
      [generateId(), user.name, doctorName, meetingId]
    );

    return NextResponse.json({ meetingId, doctorName });
  } catch (error) {
    console.error('Error creating instant consult:', error);
    return NextResponse.json({ error: 'Failed to create instant consult' }, { status: 500 });
  }
}
