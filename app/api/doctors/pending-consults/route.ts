import { NextRequest, NextResponse } from 'next/server';
import { query, update } from '@/lib/database/mysql.config';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Preflight for cross-origin PUT from video platform
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// Admin polls this every few seconds to check for waiting patients
export async function GET() {
  try {
    // Lazy cleanup: auto-end any consult that's been waiting > 90 seconds
    await update(
      `UPDATE instant_consults SET status = 'ended'
       WHERE status = 'waiting' AND TIMESTAMPDIFF(SECOND, created_at, NOW()) > 90`
    );

    const consults = await query<any>(
      `SELECT id, patient_name, doctor_name, meeting_id, created_at
       FROM instant_consults
       WHERE status = 'waiting'
       ORDER BY created_at ASC`
    );

    return NextResponse.json({ consults });
  } catch (error) {
    console.error('Error fetching pending consults:', error);
    return NextResponse.json({ error: 'Failed to fetch pending consults' }, { status: 500 });
  }
}

// Admin marks a consult as joined or ended; video platform re-notifies by meetingId
export async function PUT(request: NextRequest) {
  try {
    const { id, meetingId, status } = await request.json();
    if (!status || (!id && !meetingId)) {
      return NextResponse.json({ error: 'status and either id or meetingId are required' }, { status: 400 });
    }

    if (meetingId) {
      await update(
        `UPDATE instant_consults SET status = ?, created_at = NOW() WHERE meeting_id = ?`,
        [status, meetingId]
      );
    } else {
      await update(
        `UPDATE instant_consults SET status = ? WHERE id = ?`,
        [status, id]
      );
    }

    return NextResponse.json({ success: true }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error('Error updating consult status:', error);
    return NextResponse.json({ error: 'Failed to update consult' }, { status: 500, headers: CORS_HEADERS });
  }
}
