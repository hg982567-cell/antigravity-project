import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const host = req.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const redirectUri = `${protocol}://${host}/api/auth/callback/google`;

  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    // If Google OAuth credentials are not yet configured in env, redirect back with setup_required notice
    return NextResponse.redirect(new URL("/auth/login?google_error=setup_required", req.url));
  }

  // Construct official Google OAuth 2.0 URL
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(googleAuthUrl.toString());
}
