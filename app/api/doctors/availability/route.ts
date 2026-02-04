import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/mysql.config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorName = searchParams.get('doctorName');
    const dateStr = searchParams.get('date'); // YYYY-MM-DD format

    if (!doctorName || !dateStr) {
      return NextResponse.json(
        { error: 'doctorName and date are required' },
        { status: 400 }
      );
    }

    // Parse the date to get day of week
    const requestedDate = new Date(dateStr);
    const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'long' });

    console.log(`📅 Checking availability for ${doctorName} on ${dayOfWeek} (${dateStr})`);

    // Step 1: Check if doctor exists and has availability for this day of week
    const availabilityRows = await query(
      `SELECT
        da.id,
        da.doctor_name,
        da.start_time,
        da.end_time,
        da.slot_duration_minutes,
        da.is_active
       FROM doctor_availability da
       WHERE da.doctor_name LIKE ?
       AND da.day_of_week = ?
       AND da.is_active = 1`,
      [`%${doctorName}%`, dayOfWeek]
    );

    if (!availabilityRows || availabilityRows.length === 0) {
      // Doctor not available on this day - find alternative doctors
      const altDoctorsRows = await query(
        `SELECT DISTINCT da.doctor_name
         FROM doctor_availability da
         WHERE da.day_of_week = ?
         AND da.is_active = 1
         AND da.doctor_name != ?
         LIMIT 3`,
        [dayOfWeek, doctorName]
      );

      const alternativeDoctors = altDoctorsRows.map((row: any) => row.doctor_name);

      return NextResponse.json({
        available: false,
        message: `Dr. ${doctorName} is not available on ${dayOfWeek}`,
        alternativeDoctors,
      });
    }

    // Step 2: Generate all possible time slots for the day
    const availability = availabilityRows[0];
    const startTime = availability.start_time; // e.g., "09:00:00"
    const endTime = availability.end_time; // e.g., "17:00:00"
    const slotDuration = availability.slot_duration_minutes || 30;

    // Convert times to minutes
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Generate all time slots
    const allSlots = [];
    for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDuration) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
      allSlots.push(timeStr);
    }

    // Step 3: Get already booked appointments for this doctor on this date
    const bookedSlotsRows = await query(
      `SELECT
        TIME(schedule) as booked_time
       FROM appointments
       WHERE primary_physician LIKE ?
       AND DATE(schedule) = ?
       AND status IN ('pending', 'scheduled')`,
      [`%${doctorName}%`, dateStr]
    );

    const bookedTimes = new Set(
      bookedSlotsRows.map((row: any) => row.booked_time)
    );

    // Step 4: Filter out booked slots
    const availableSlots = allSlots.filter((slot) => !bookedTimes.has(slot));

    // Format times for human readability (e.g., "2:00 PM")
    const formatTime = (timeStr: string) => {
      const [hours, mins] = timeStr.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
    };

    const formattedSlots = availableSlots.map(formatTime);

    console.log(`✅ Found ${formattedSlots.length} available slots for ${doctorName}`);

    return NextResponse.json({
      available: true,
      doctorName,
      dayOfWeek,
      date: dateStr,
      availableSlots: formattedSlots,
      totalSlots: allSlots.length,
      bookedSlots: bookedTimes.size,
    });
  } catch (error) {
    console.error('Error checking doctor availability:', error);
    return NextResponse.json(
      { error: 'Failed to check doctor availability', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
