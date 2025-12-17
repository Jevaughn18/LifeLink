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

    // Query patient by email
    const patient = await queryOne<any>(
      'SELECT id, name, email, phone FROM patients WHERE email = ?',
      [email]
    );

    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      patientId: patient.id,
      patient: {
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
      },
    });
  } catch (error) {
    console.error('Error fetching patient by email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}
