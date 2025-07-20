import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /protected)
  const path = request.nextUrl.pathname

  // Define paths that require authentication
  const protectedPaths = ["/protected", "/practice", "/profile"]

  // Define public paths that should redirect to home if authenticated
  const publicPaths = ["/auth/login", "/auth/register"]

  // Check if the current path requires authentication
  const isProtectedPath = protectedPaths.some((protectedPath) => path.startsWith(protectedPath))

  // Check if the current path is a public auth path
  const isPublicPath = publicPaths.some((publicPath) => path.startsWith(publicPath))

  // Get the token from the request cookies
  const token = request.cookies.get("auth-token")?.value

  // Verify the token
  let isAuthenticated = false
  if (token) {
    const user = await verifyToken(token)
    isAuthenticated = !!user
  }

  // If the path requires authentication and user is not authenticated
  if (isProtectedPath && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // If user is authenticated and trying to access public auth pages
  if (isPublicPath && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Continue with the request
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
