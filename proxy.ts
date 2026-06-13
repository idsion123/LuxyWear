import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

const adminPaths = ["/admin"];
const adminApiPaths = ["/api/admin"];
const protectedApiPaths = ["/api/auth/me", "/api/cart", "/api/orders"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin page protection - redirect to login
  if (
    adminPaths.some((p) => pathname.startsWith(p)) &&
    pathname !== "/admin/login"
  ) {
    const token = request.cookies.get("admin_session")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    const payload = await verifyToken(token, "admin");
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    const headers = new Headers(request.headers);
    headers.set("x-admin-id", payload.userId);
    return NextResponse.next({ request: { headers } });
  }

  // Admin API protection - return 401 (skip login endpoint)
  if (adminApiPaths.some((p) => pathname.startsWith(p)) && pathname !== "/api/admin/login") {
    const token = request.cookies.get("admin_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const payload = await verifyToken(token, "admin");
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const headers = new Headers(request.headers);
    headers.set("x-admin-id", payload.userId);
    return NextResponse.next({ request: { headers } });
  }

  // Customer API protection
  if (protectedApiPaths.some((p) => pathname.startsWith(p))) {
    const token = request.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const payload = await verifyToken(token, "customer");
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const headers = new Headers(request.headers);
    headers.set("x-user-id", payload.userId);
    return NextResponse.next({ request: { headers } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/auth/me", "/api/cart/:path*", "/api/orders/:path*"],
};
