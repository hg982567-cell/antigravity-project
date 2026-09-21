import { NextResponse, type NextRequest } from "next/server";

function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = Buffer.from(base64, "base64").toString("utf-8");
    const payload = JSON.parse(jsonStr);
    // Strict token expiration validation
    if (payload.exp && typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 0. Path Normalization & Canonical Route Redirection
  const canonicalRedirects: Record<string, string> = {
    "/dashboard": "/app/dashboard",
    "/product-research": "/app/product-research",
    "/product-research-radar": "/app/product-research",
    "/products": "/app/products",
    "/orders": "/app/orders",
    "/stores": "/app/stores",
    "/suppliers": "/app/suppliers",
    "/customers": "/app/customers",
    "/settings": "/app/settings",
    "/analytics": "/app/analytics",
    "/shipping": "/app/shipping",
    "/creative-studio": "/app/creative-studio",
    "/ads": "/app/ads",
    "/automations": "/app/automations",
    "/integrations": "/app/integrations",
    "/notifications": "/app/notifications",
    "/ai-assistant": "/app/ai-assistant",
    "/billing": "/app/billing",
    "/subscription": "/app/billing",
    "/subscriptions": "/app/billing",
    "/dashboard/billing": "/app/billing",
    "/dashboard/subscription": "/app/billing",
    "/app/subscription": "/app/billing",
    "/app/subscriptions": "/app/billing",
    "/login": "/auth/login",
    "/signup": "/auth/signup",
    "/admin": "/owner/dashboard",
    "/admin/dashboard": "/owner/dashboard",
    "/admin/users": "/owner/users",
    "/admin/billing": "/owner/subscriptions",
    "/admin/subscription": "/owner/subscriptions",
    "/admin/subscriptions": "/owner/subscriptions",
    "/admin/ai": "/owner/ai",
    "/admin/shipping": "/owner/shipping",
    "/admin/profit": "/owner/profit",
    "/admin/security": "/owner/security",
    "/admin/system": "/owner/system",
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

  // Catch-all for any unmapped /admin/:path* routes -> redirect to /owner/:path*
  if (pathname.startsWith("/admin/")) {
    const subPath = pathname.slice("/admin".length);
    const targetUrl = new URL(`/owner${subPath}`, request.url);
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

  // Read cookies & decode payloads
  const sessionToken = request.cookies.get("dropai_session_token")?.value;
  const ownerToken = request.cookies.get("dropai_owner_session_token")?.value;

  const sessionPayload = sessionToken ? decodeJwtPayload(sessionToken) : null;
  const ownerPayload = ownerToken ? decodeJwtPayload(ownerToken) : null;

  // Authoritative owner check: purely role-based
  const hasOwnerRole = Boolean(
    (ownerPayload && ownerPayload.role === "OWNER") ||
    (sessionPayload && sessionPayload.role === "OWNER")
  );

  // 1. Protect Merchant App routes (/app/*)
  if (pathname.startsWith("/app")) {
    if (!sessionPayload && !ownerPayload) {
      const loginUrl = new URL("/auth/login", request.url);
      const redirectTarget = pathname + (request.nextUrl.search || "");
      loginUrl.searchParams.set("redirect", redirectTarget);
      const redirectResponse = NextResponse.redirect(loginUrl);
      if (sessionToken && !sessionPayload) {
        redirectResponse.cookies.delete("dropai_session_token");
      }
      if (ownerToken && !ownerPayload) {
        redirectResponse.cookies.delete("dropai_owner_session_token");
      }
      return redirectResponse;
    }

    // Enforce email verification on /app/* if unverified
    if (sessionPayload && !hasOwnerRole && sessionPayload.isEmailVerified === false) {
      const verifyUrl = new URL("/auth/verify-email", request.url);
      if (sessionPayload.email) {
        verifyUrl.searchParams.set("email", sessionPayload.email);
      }
      return NextResponse.redirect(verifyUrl);
    }
  }

  // 2. Protect Owner Control Center routes (/owner/*)
  if (pathname.startsWith("/owner")) {
    if (pathname === "/owner/login") {
      return response;
    }

    // Strict Isolation: Users authenticated as normal MERCHANTS are strictly blocked from /owner/*
    if (sessionPayload && sessionPayload.role === "MERCHANT" && !hasOwnerRole) {
      const loginUrl = new URL("/owner/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    if (!hasOwnerRole) {
      const loginUrl = new URL("/owner/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Protect Merchant App API routes (/api/app/*)
  if (pathname.startsWith("/api/app") && pathname !== "/api/app/seed") {
    if (!sessionPayload && !ownerPayload) {
      return NextResponse.json(
        { error: "Access Denied: Authentication Required" },
        { status: 401 }
      );
    }

    if (sessionPayload && !hasOwnerRole && sessionPayload.isEmailVerified === false) {
      return NextResponse.json(
        { error: "Email verification required before accessing store APIs." },
        { status: 403 }
      );
    }
  }

  // 4. Protect Owner API routes (/api/owner/*)
  if (pathname.startsWith("/api/owner")) {
    const isPublicAuthRoute =
      pathname === "/api/owner/auth/verify-email" ||
      pathname === "/api/owner/auth/login";

    if (!isPublicAuthRoute) {
      // Strict Isolation: Merchant accounts cannot access owner APIs
      if (sessionPayload && sessionPayload.role === "MERCHANT" && !hasOwnerRole) {
        return NextResponse.json(
          { error: "Access Denied: Merchant accounts cannot access Owner APIs." },
          { status: 403 }
        );
      }

      if (!hasOwnerRole) {
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
