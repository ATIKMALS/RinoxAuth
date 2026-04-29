import { env } from "@/lib/config";
import { loginSchema } from "@/lib/validators";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { success: false, message: "Invalid login payload." },
        { status: 400 }
      );
    }

    const upstream = await fetch(`${env.BACKEND_BASE_URL}/api/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "login",
        appname: env.BACKEND_APP_NAME,
        ownerid: env.BACKEND_OWNER_ID,
        secret: env.BACKEND_SECRET,
        username: parsed.data.username,
        password: parsed.data.password
      })
    });

    const data = await upstream.json();

    if (!upstream.ok || !data.success) {
      return Response.json(
        { success: false, message: data.message ?? "Invalid credentials." },
        { status: 401 }
      );
    }

    const token = data.token ?? data.session ?? "";
    cookies().set(env.SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24
    });

    return Response.json({ success: true, message: "Login successful." });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unexpected error."
      },
      { status: 500 }
    );
  }
}
