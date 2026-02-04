import { NextRequest, NextResponse } from "next/server";

// Routes that do not require a valid session cookie
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/verify-email",
  "/register/complete",
  "/admin",
];

// API prefixes that are public (own auth or no patient data)
const PUBLIC_API_PREFIXES = [
  "/api/patient/authenticate",
  "/api/patient/get-by-email",
  "/api/appointments/available-slots",
  "/api/doctors/",
  "/api/sagicor/",
  "/api/auth/logout",
];

// Edge-compatible JWT verification using SubtleCrypto.
// jsonwebtoken cannot be imported here — middleware runs in the Edge Runtime
// which has no access to Node.js crypto.  SubtleCrypto is available everywhere.
async function verifySessionToken(
  token: string
): Promise<{ patientId: string; email: string; name: string } | null> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;

    // Import the shared secret as an HMAC key
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // base64url → Uint8Array
    const sigBytes = Uint8Array.from(
      atob(signature.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0)
    );

    // Verify the signature against header.payload
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      new TextEncoder().encode(`${header}.${payload}`)
    );

    if (!isValid) return null;

    // Decode the payload (base64url → JSON)
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );

    // Check expiration
    if (decoded.exp && Date.now() / 1000 > decoded.exp) return null;

    return { patientId: decoded.patientId, email: decoded.email, name: decoded.name };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exact public page match
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Public API prefix match
  if (PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Static assets and Next.js internals — always pass through
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/uploads/") ||
    pathname.startsWith("/api/sentry")
  ) {
    return NextResponse.next();
  }

  // --- Protected territory ---
  const token = request.cookies.get("session")?.value;
  const user = token ? await verifySessionToken(token) : null;

  if (!user) {
    // API routes get a 401 JSON response
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Page routes get redirected to login
    return NextResponse.redirect(request.nextUrl.origin + "/login");
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except static files (Next.js convention)
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
