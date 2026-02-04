import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/mysql.config';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const doctorName = searchParams.get('doctor');
    const date = searchParams.get('date'); // Format: YYYY-MM-DD

    if (!doctorName || !date) {
      return NextResponse.json(
        { error: 'Doctor name and date are required' },
        { status: 400 }
      );
    }

    // Get day of week from the date
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Get doctor's availability for that day
    const availability = await query<any>(
      `SELECT start_time, end_time, slot_duration_minutes
       FROM doctor_availability
       WHERE doctor_name = ? AND day_of_week = ? AND is_active = TRUE`,
      [doctorName, dayOfWeek]
    );

    if (availability.length === 0) {
      return NextResponse.json({
        success: true,
        slots: [],
        message: `Dr. ${doctorName} is not available on ${dayOfWeek}s`
      });
    }

    const schedule = availability[0];
    const startTime = schedule.start_time;
    const endTime = schedule.end_time;
    const slotDuration = schedule.slot_duration_minutes;

    // Generate time slots
    const slots = [];
    let currentTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    while (currentTime < endDateTime) {
      const slotTime = currentTime.toTimeString().slice(0, 5); // HH:MM format

      // Check if this slot is already booked
      const isBooked = await query<any>(
        `SELECT id FROM appointments
         WHERE primary_physician = ?
         AND DATE(schedule) = ?
         AND TIME(schedule) = ?
         AND status IN ('pending', 'scheduled')`,
        [doctorName, date, slotTime]
      );

      if (isBooked.length === 0) {
        slots.push({
          time: slotTime,
          formatted: currentTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        });
      }

      // Move to next slot
      currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
    }

    return NextResponse.json({
      success: true,
      slots,
      doctor: doctorName,
      date,
      dayOfWeek
    });
  } catch (error: any) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch available slots' },
      { status: 500 }
    );
  }
}
