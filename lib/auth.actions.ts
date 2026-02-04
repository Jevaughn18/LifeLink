"use server";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { signToken } from "./auth";

const SECRET = process.env.JWT_SECRET!;

const SESSION_COOKIE = {
  name: "session",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 86400, // 24 h
};

const PENDING_COOKIE = {
  name: "pending_registration",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 3600, // 1 h
};

export async function setSessionCookie(patientId: string, email: string, name: string): Promise<void> {
  const token = signToken({ patientId, email, name });
  const store = await cookies();
  store.set({ ...SESSION_COOKIE, value: token });
  store.delete(PENDING_COOKIE.name);
}

export async function setPendingRegistrationCookie(email: string, name: string): Promise<void> {
  const payload = JSON.stringify({ email, name });
  const signed = jwt.sign({ data: payload }, SECRET, { expiresIn: "1h" });
  const store = await cookies();
  store.set({ ...PENDING_COOKIE, value: signed });
}

export async function clearPendingRegistrationCookie(): Promise<void> {
  const store = await cookies();
  store.delete(PENDING_COOKIE.name);
}

export async function getPendingRegistration(): Promise<{ email: string; name: string } | null> {
  const store = await cookies();
  const token = store.get("pending_registration")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, SECRET) as { data: string };
    return JSON.parse(decoded.data);
  } catch {
    return null;
  }
}
