import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const appId = cookieStore.get("currentAppId")?.value;
    
    return NextResponse.json({ 
      success: true, 
      appId: appId || null 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: "Failed to get app ID",
      appId: null 
    }, { status: 500 });
  }
}
