import { NextResponse } from 'next/server';
import { query } from '@/lib/database/mysql.config';

export async function POST(request: Request) {
  try {
    const { email, tempUserId } = await request.json();

    if (!email || !tempUserId) {
      return NextResponse.json(
        { error: 'Email and tempUserId are required' },
        { status: 400 }
      );
    }

    // Update the verification record with the temp user ID
    await query(
      `UPDATE email_verifications
       SET temp_user_id = ?
       WHERE email = ? AND is_verified = TRUE
       ORDER BY verified_at DESC
       LIMIT 1`,
      [tempUserId, email]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing temp user ID:', error);
    return NextResponse.json(
      { error: 'Failed to store temp user ID' },
      { status: 500 }
    );
  }
}
