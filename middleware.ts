import { NextResponse, type NextRequest } from "next/server";

function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 0. Path Normalization & Canonical Route Redirection (Resolves all 404s for un-prefixed SaaS routes)
  const canonicalRedirects: Record<string, string> = {
    "/billing": "/app/billing",
    "/subscription": "/app/billing",
    "/subscriptions": "/app/billing",
    "/dashboard/billing": "/app/billing",
    "/dashboard/subscription": "/app/billing",
    "/app/subscription": "/app/billing",
    "/app/subscriptions": "/app/billing",
    "/dashboard": "/app/dashboard",
    "/products": "/app/products",
    "/orders": "/app/orders",
    "/stores": "/app/stores",
    "/suppliers": "/app/suppliers",
    "/customers": "/app/customers",
    "/settings": "/app/settings",
    "/analytics": "/app/analytics",
    "/admin": "/owner/dashboard",
    "/admin/billing": "/owner/subscriptions",
    "/admin/subscription": "/owner/subscriptions",
    "/admin/subscriptions": "/owner/subscriptions",
    "/owner/billing": "/owner/subscriptions",
    "/owner/subscription": "/owner/subscriptions",
  };

  if (canonicalRedirects[pathname]) {
    const targetUrl = new URL(canonicalRedirects[pathname], request.url);
    if (request.nextUrl.search) {
      targetUrl.search = request.nextUrl.search;
    }
    return NextResponse.redirect(targetUrl, 308);
  }

  // Add security headers to all responses
  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // 1. Protect Merchant App routes (/app/*)
  if (pathname.startsWith("/app")) {
    const sessionToken = request.cookies.get("dropai_session_token")?.value;
    const ownerToken = request.cookies.get("dropai_owner_session_token")?.value;

    if (!sessionToken && !ownerToken) {
      const loginUrl = new URL("/auth/login", request.url);
      const redirectTarget = pathname + (request.nextUrl.search || "");
      loginUrl.searchParams.set("redirect", redirectTarget);
      return NextResponse.redirect(loginUrl);
    }

    // Enforce email verification on /app/*
    if (sessionToken && !ownerToken) {
      const payload = decodeJwtPayload(sessionToken);
      if (payload && payload.isEmailVerified === false && payload.role !== "OWNER") {
        const verifyUrl = new URL("/auth/verify-email", request.url);
        if (payload.email) {
          verifyUrl.searchParams.set("email", payload.email);
        }
        return NextResponse.redirect(verifyUrl);
      }
    }
  }

  // 2. Protect Owner Control Center routes (/owner/*)
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

  // 3. Protect Merchant App API routes (/api/app/*)
  if (pathname.startsWith("/api/app") && pathname !== "/api/app/seed") {
    const sessionToken = request.cookies.get("dropai_session_token")?.value;
    const ownerToken = request.cookies.get("dropai_owner_session_token")?.value;

    if (!sessionToken && !ownerToken) {
      return NextResponse.json(
        { error: "Access Denied: Authentication Required" },
        { status: 401 }
      );
    }

    // Block unverified accounts from mutating store data
    if (sessionToken && !ownerToken) {
      const payload = decodeJwtPayload(sessionToken);
      if (payload && payload.isEmailVerified === false && payload.role !== "OWNER") {
        return NextResponse.json(
          { error: "Email verification required before accessing store APIs." },
          { status: 403 }
        );
      }
    }
  }

  // 4. Protect Owner API routes (/api/owner/*)
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
