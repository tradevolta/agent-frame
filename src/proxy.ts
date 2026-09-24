import { NextResponse, type NextRequest } from "next/server";

// Basic-auth gate for the admin dashboard and admin APIs.
export function proxy(request: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    if (process.env.NODE_ENV === "production") return new NextResponse("Admin disabled: set ADMIN_PASSWORD", { status: 503 });
    return NextResponse.next();
  }
  const header = request.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    const decoded = atob(encoded);
    if (decoded.slice(decoded.indexOf(":") + 1) === password) return NextResponse.next();
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="admin"' },
  });
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
