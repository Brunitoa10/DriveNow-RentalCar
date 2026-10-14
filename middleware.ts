import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@modules/admin-auth/session";

/**
 * Protege el panel /admin con la cookie firmada.
 * Los clientes navegan y reservan sin cuenta.
 */
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_ACCESS_KEY || "";
  const valid = await verifySessionToken(req.cookies.get(ADMIN_COOKIE)?.value, secret);
  if (valid) return NextResponse.next();

  const loginUrl = new URL("/admin/login", req.url);
  loginUrl.searchParams.set("next", pathname + search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
