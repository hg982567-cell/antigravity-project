import { NextResponse } from "next/server";
import { POST as handleSessionPost } from "@/app/api/auth/session/route";

export async function POST(req: Request) {
  try {
    const clone = req.clone();
    const body = await clone.json().catch(() => ({}));

    // If client passes an idToken from Firebase signUp, delegate to the session handler
    if (body.idToken) {
      return handleSessionPost(req);
    }

    return NextResponse.json(
      { error: "Account creation requires Firebase Authentication. Passwords must never be sent in plaintext." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Signup route error:", error);
    return NextResponse.json(
      { error: "Could not complete account creation. Please try again." },
      { status: 500 }
    );
  }
}
