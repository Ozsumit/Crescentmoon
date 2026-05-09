import { NextResponse } from "next/server";

export function middleware(request) {
  const isAdmin = request.cookies.get("admin_token");

  if (request.nextUrl.pathname.startsWith("/abmin")) {
    if (isAdmin?.value === process.env.ADMIN_PASSWORD) {
      return NextResponse.next();
    }
    return NextResponse.rewrite(new URL("/login", request.url));
  }
}
