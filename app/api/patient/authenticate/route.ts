import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/database/mysql.config';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const patient = await queryOne<any>(
      'SELECT id, name, email, phone, password FROM patients WHERE email = ?',
      [email]
    );

    // Unified error for missing user / missing password / wrong password — prevents enumeration
    if (!patient || !patient.password) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, patient.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Sign JWT — patientId stays server-side, never sent in the response body
    const token = signToken({ patientId: patient.id, email: patient.email, name: patient.name });

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: 'session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400,
    });

    return response;
  } catch (error) {
    console.error('Error authenticating patient:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to authenticate' },
      { status: 500 }
    );
  }
}
