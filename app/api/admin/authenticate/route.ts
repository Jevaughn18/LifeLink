import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function POST(request: NextRequest) {
  try {
    const { passkey } = await request.json();

    // Validate passkey against environment variable
    if (!passkey || passkey !== process.env.NEXT_PUBLIC_ADMIN_PASSKEY) {
      return NextResponse.json(
        { success: false, error: "Invalid passkey" },
        { status: 401 }
      );
    }

    // Create admin session token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Sign a JWT for the admin session (24 hour expiry)
    const token = await new SignJWT({ role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .setIssuedAt()
      .sign(new TextEncoder().encode(secret));

    // Create response with admin session cookie
    const response = NextResponse.json({ success: true });

    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Admin authentication error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}
