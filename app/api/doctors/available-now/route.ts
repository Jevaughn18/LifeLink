import { NextResponse } from 'next/server';
import { query } from '@/lib/database/mysql.config';

export async function GET() {
  try {
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

    return NextResponse.json({
      available: doctors.length > 0,
      doctors: doctors.map((d: any) => d.doctor_name),
    });
  } catch (error) {
    console.error('Error checking current availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
