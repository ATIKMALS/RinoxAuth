// components/layout/session-cookie-setter.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { autoSetFirstAppCookie } from "@/services/api";
import { cookies } from "next/headers";

export async function SessionCookieSetter() {
  let currentUser: string | undefined;

  try {
    const session = await getServerSession(authOptions);
    currentUser = session?.user?.username;
  } catch (error) {
    console.error("⚠️ Failed to get session:", error);
  }

  if (currentUser) {
    try {
      const cookieStore = await cookies();
      const existingAppId = cookieStore.get("currentAppId")?.value;

      if (!existingAppId) {
        console.log(`🔄 Setting auto cookie for user: ${currentUser}`);
        await autoSetFirstAppCookie(currentUser);
      } else {
        console.log(`ℹ️ Cookie already exists: ${existingAppId}`);
      }
    } catch (error) {
      console.error("⚠️ Failed to auto-set app cookie:", error);
    }
  }

  // এই component কিছু render করে না, শুধু cookie সেট করে
  return null;
}