import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Add security headers to all responses
  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Protect Owner Control Center routes (/owner/*)
  if (pathname.startsWith("/owner")) {
    // Permit access to /owner/login
    if (pathname === "/owner/login") {
      return response;
    }

    const ownerToken = request.cookies.get("dropai_owner_session_token")?.value;
    if (!ownerToken) {
      // Redirect unauthenticated visitors directly to /owner/login
      const loginUrl = new URL("/owner/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Owner API routes (/api/owner/*)
  if (pathname.startsWith("/api/owner")) {
    const isPublicAuthRoute =
      pathname === "/api/owner/auth/verify-email" ||
      pathname === "/api/owner/auth/login";

    if (!isPublicAuthRoute) {
      const ownerToken = request.cookies.get("dropai_owner_session_token")?.value;
      if (!ownerToken) {
        return NextResponse.json(
          { error: "Access Denied: Owner Authorization Required" },
          { status: 403 }
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
