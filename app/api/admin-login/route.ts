// import { NextRequest, NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// export async function POST(req: NextRequest) {
//   const body = await req.json();
//   const { passkey } = body;

//   const adminPasskey = process.env.ADMIN_PASSKEY;

//   if (passkey === adminPasskey) {
//     const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET!, { expiresIn: "1h" });

//     const response = NextResponse.json({ message: "Access granted" });
//     response.cookies.set({
//       name: "adminToken",
//       value: token,
//       httpOnly: true,
//       secure: true,
//       path: "/",
//       sameSite: "strict",
//     });

//     return response;
//   } else {
//     return NextResponse.json({ message: "Invalid passkey" }, { status: 401 });
//   }
// }
