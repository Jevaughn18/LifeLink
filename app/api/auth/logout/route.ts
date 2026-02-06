import { NextResponse } from 'next/server';

export async function POST() {
  // Create a JSON response
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

  // Clear the session cookie
  response.cookies.set({
    name: 'session',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
