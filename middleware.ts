import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protected paths that require authentication
  const protectedPaths = ["/", "/practice", "/protected"]

  // Auth paths that should redirect if already authenticated
  const authPaths = ["/auth/login", "/auth/register"]

  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some((path) => pathname === path || pathname.startsWith(path + "/"))

  // Check if the current path is an auth path
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path))

  // Get the auth token from cookies
  const token = request.cookies.get("auth-token")?.value

  let user = null
  if (token) {
    user = await verifyToken(token)
  }

  // If accessing a protected path without authentication, redirect to login
  if (isProtectedPath && !user) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // If accessing auth paths while authenticated, redirect to home
  if (isAuthPath && user) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
