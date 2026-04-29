import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

function isPublicPath(pathname: string) {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

const authSecret = process.env.NEXTAUTH_SECRET || process.env.BACKEND_SECRET;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = isPublicPath(pathname);
  const token = await getToken({ req, secret: authSecret });
  const hasSession = !!token;

  // Auth check
  if (!isPublic && !hasSession) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if ((pathname === "/login" || pathname === "/signup") && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ✅ Auto-set currentAppId cookie
  if (hasSession && !isPublic) {
    const currentAppId = req.cookies.get("currentAppId")?.value;
    const username = token?.name || token?.sub || token?.email?.split("@")[0];

    if (!currentAppId && username) {
      try {
        // 🔥 তোমার Railway.app backend URL
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://discerning-kindness-production-8967.up.railway.app";
        
        const appsRes = await fetch(
          `${BASE_URL}/api/apps?created_by=${encodeURIComponent(username)}`,
          { cache: "no-store" }
        );

        if (appsRes.ok) {
          const appsData = await appsRes.json();
          const apps = appsData?.data || [];

          if (apps.length > 0) {
            const firstAppId = String(apps[0].id);
            const response = NextResponse.next();

            response.cookies.set("currentAppId", firstAppId, {
              path: "/",
              maxAge: 86400,
              httpOnly: true,
              sameSite: "lax",
            });

            console.log(`✅ Middleware: Auto-set currentAppId cookie to ${firstAppId} for user ${username}`);
            return response;
          }
        }
      } catch (error) {
        console.error("⚠️ Middleware cookie set error:", error);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/dashboard/:path*",
    "/apps/:path*",
    "/users/:path*",
    "/licenses/:path*",
    "/api-keys/:path*",
    "/analytics/:path*",
    "/resellers/:path*",
    "/credentials/:path*",
    "/activity-logs/:path*",
    "/settings/:path*"
  ]
};