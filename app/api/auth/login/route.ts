import { NextResponse } from "next/server";
import { POST as handleSessionPost } from "@/app/api/auth/session/route";

export async function POST(req: Request) {
  try {
    const clone = req.clone();
    const body = await clone.json().catch(() => ({}));

    // If client passes an idToken, delegate to the production Firebase session handler
    if (body.idToken) {
      return handleSessionPost(req);
    }

    // Direct password submission to the backend is rejected per strict security requirements
    return NextResponse.json(
      { error: "Invalid email or password. Please use Firebase Authentication to authenticate." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 500 }
    );
  }
}
