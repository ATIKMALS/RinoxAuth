import { env } from "@/lib/config";
import { cookies } from "next/headers";

export async function POST() {
  cookies().set(env.SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0)
  });

  return Response.json({ success: true, message: "Logged out." });
}
