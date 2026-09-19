import { NextResponse, type NextRequest } from "next/server";

/** Pass the /app path through so login can return the user to the page they wanted. */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-stadilearn-path", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = { matcher: ["/app/:path*"] };
