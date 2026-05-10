import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/dealer")) {
    return NextResponse.next();
  }

  const hasSupabaseCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.includes("supabase") || cookie.name.startsWith("sb-"));

  if (!hasSupabaseCookie) {
    const url = new URL("/", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dealer/:path*"],
};
