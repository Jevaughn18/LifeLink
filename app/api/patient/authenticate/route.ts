import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/database/mysql.config';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Query patient by email
    const patient = await queryOne<any>(
      'SELECT id, name, email, phone, password FROM patients WHERE email = ?',
      [email]
    );

    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if patient has a password set
    if (!patient.password) {
      return NextResponse.json(
        { success: false, error: 'Account not fully set up. Please complete your registration.' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, patient.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Authentication successful
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
    console.error('Error authenticating patient:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to authenticate' },
      { status: 500 }
    );
  }
}
