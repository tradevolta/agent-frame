import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, passwordMatches, verifySession } from "@/lib/admin-session";

// Gate for the admin dashboard and admin APIs. Accepts the login-form session
// cookie (works in every browser, including in-app browsers that never show a
// Basic-auth prompt) or a Basic-auth header (handy for curl/scripts).
const PUBLIC = new Set(["/admin/login", "/api/admin/login", "/api/admin/logout"]);

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (PUBLIC.has(pathname)) return NextResponse.next();

  if (!process.env.ADMIN_PASSWORD) {
    if (process.env.NODE_ENV === "production") return new NextResponse("Admin disabled: set ADMIN_PASSWORD", { status: 503 });
    return NextResponse.next();
  }

  if (await verifySession(request.cookies.get(ADMIN_COOKIE)?.value)) return NextResponse.next();

  const [scheme, encoded] = (request.headers.get("authorization") ?? "").split(" ");
  if (scheme === "Basic" && encoded) {
    try {
      const decoded = atob(encoded);
      if (passwordMatches(decoded.slice(decoded.indexOf(":") + 1))) return NextResponse.next();
    } catch {}
  }

  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Please log in to the admin page again." }, { status: 401 });
  const login = new URL("/admin/login", request.url);
  login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login);
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
