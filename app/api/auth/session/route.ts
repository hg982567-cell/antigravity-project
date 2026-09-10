import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getCurrentOwner } from "@/lib/auth/owner-session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const owner = await getCurrentOwner();

    const isOwner = !!owner;
    const effectiveUser = user || (owner ? {
      id: owner.id,
      name: owner.name,
      email: owner.email,
      role: "OWNER",
      isEmailVerified: true,
      twoFactorEnabled: true,
    } : null);

    if (!effectiveUser) {
      return NextResponse.json({ authenticated: false, user: null, isOwner: false }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      user: effectiveUser,
      isOwner,
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, user: null, isOwner: false }, { status: 500 });
  }
}
