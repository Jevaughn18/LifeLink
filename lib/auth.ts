import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const SECRET = process.env.JWT_SECRET!;

export interface AuthPayload {
  patientId: string;
  email: string;
  name: string;
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET) as AuthPayload & { iat?: number; exp?: number };
    return { patientId: decoded.patientId, email: decoded.email, name: decoded.name };
  } catch {
    return null;
  }
}

// Reads the session cookie from an incoming NextRequest and returns the verified payload.
// Used by middleware and API route handlers.
export function getAuthenticatedUser(request: NextRequest): AuthPayload | null {
  const token = request.cookies.get("session")?.value;
  if (!token) return null;
  return verifyToken(token);
}
