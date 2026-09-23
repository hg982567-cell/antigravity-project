import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "dropai_production_default_secret_key_change_me_in_prod"
);

async function verifyToken(token?: string): Promise<any | null> {
  if (!token || typeof token !== "string") return null;
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    // Strict token expiration validation
    if (payload.exp && typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Add security headers to all responses
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Read cookies & verify cryptographically
  const sessionToken = request.cookies.get("dropai_session_token")?.value;
  const ownerToken = request.cookies.get("dropai_owner_session_token")?.value;

  const [sessionPayload, ownerPayload] = await Promise.all([
    verifyToken(sessionToken),
    verifyToken(ownerToken),
  ]);

  const isAuthenticated = Boolean(sessionPayload || ownerPayload);
  // Strict Owner Isolation: Only dedicated owner session token (issued after password authentication) grants Owner access
  const hasOwnerRole = Boolean(
    ownerPayload && (ownerPayload.role === "OWNER" || ownerPayload.role === "ADMIN")
  );

  // 0. Protected Canonical Route Aliases
  const merchantProtectedRedirects: Record<string, string> = {
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
    "/social-accounts": "/app/social-accounts",
  };

  const adminProtectedRedirects: Record<string, string> = {
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
    "/admin/docs": "/owner/docs",
    "/owner/billing": "/owner/subscriptions",
    "/owner/subscription": "/owner/subscriptions",
  };

  // Auth & Docs shortcut aliases
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/auth/login", request.url), 307);
  }
  if (pathname === "/signup") {
    return NextResponse.redirect(new URL("/auth/signup", request.url), 307);
  }
  if (pathname === "/docs") {
    return NextResponse.redirect(new URL("/help", request.url), 308);
  }
  if (pathname.startsWith("/docs/")) {
    const sub = pathname.slice("/docs".length);
    return NextResponse.redirect(new URL(`/help${sub}`, request.url), 308);
  }

  // Handle Merchant Protected Aliases (e.g. /dashboard, /product-research, etc.)
  if (merchantProtectedRedirects[pathname]) {
    const targetPath = merchantProtectedRedirects[pathname];
    if (!isAuthenticated) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", targetPath);
      return NextResponse.redirect(loginUrl, 307);
    }
    const targetUrl = new URL(targetPath, request.url);
    if (request.nextUrl.search) targetUrl.search = request.nextUrl.search;
    return NextResponse.redirect(targetUrl, 307);
  }

  // Handle Admin Protected Aliases (e.g. /admin, /admin/users, /admin/*)
  if (adminProtectedRedirects[pathname] || pathname.startsWith("/admin/")) {
    const targetSubPath = adminProtectedRedirects[pathname]
      ? adminProtectedRedirects[pathname]
      : `/owner${pathname.slice("/admin".length)}`;

    if (!hasOwnerRole) {
      const loginUrl = new URL("/owner/login", request.url);
      loginUrl.searchParams.set("redirect", targetSubPath);
      return NextResponse.redirect(loginUrl, 307);
    }
    const targetUrl = new URL(targetSubPath, request.url);
    if (request.nextUrl.search) targetUrl.search = request.nextUrl.search;
    return NextResponse.redirect(targetUrl, 307);
  }

  // 1. Strict Protection for Merchant App Routes (/app/*)
  if (pathname.startsWith("/app")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/auth/login", request.url);
      const redirectTarget = pathname + (request.nextUrl.search || "");
      loginUrl.searchParams.set("redirect", redirectTarget);
      const redirectResponse = NextResponse.redirect(loginUrl, 307);

      if (sessionToken && !sessionPayload) {
        redirectResponse.cookies.delete("dropai_session_token");
      }
      if (ownerToken && !ownerPayload) {
        redirectResponse.cookies.delete("dropai_owner_session_token");
      }
      return redirectResponse;
    }
  }

  // 2. Strict Protection & Isolation for Owner / Admin Routes (/owner/*)
  if (pathname.startsWith("/owner")) {
    if (pathname === "/owner/login") {
      return response;
    }

    // Strict Role Separation: Normal merchants cannot access Owner routes
    if (!hasOwnerRole) {
      const loginUrl = new URL("/owner/login", request.url);
      loginUrl.searchParams.set("redirect", pathname + (request.nextUrl.search || ""));
      return NextResponse.redirect(loginUrl, 307);
    }
  }

  // 3. API Protection for Merchant APIs (/api/app/*)
  if (pathname.startsWith("/api/app") && pathname !== "/api/app/seed") {
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required to access merchant APIs." },
        { status: 401 }
      );
    }
  }

  // 4. API Protection for Owner APIs (/api/owner/*)
  if (pathname.startsWith("/api/owner")) {
    const isPublicOwnerAuth =
      pathname === "/api/owner/auth/verify-email" ||
      pathname === "/api/owner/auth/login";

    if (!isPublicOwnerAuth) {
      if (!hasOwnerRole) {
        return NextResponse.json(
          { error: "Forbidden: Platform Owner or Admin authorization required." },
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
