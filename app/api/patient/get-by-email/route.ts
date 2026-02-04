import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/database/mysql.config';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check existence only — no PII or IDs in the response
    const patient = await queryOne<any>(
      'SELECT 1 FROM patients WHERE email = ?',
      [email]
    );

    return NextResponse.json({ exists: !!patient });
  } catch (error) {
    console.error('Error fetching patient by email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}
