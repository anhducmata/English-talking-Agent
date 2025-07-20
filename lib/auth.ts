import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")
const SALT_ROUNDS = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS || "12")

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function generateToken(payload: { email: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { email: string }
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  cookies().set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

export async function clearAuthCookie(): Promise<void> {
  cookies().delete("auth-token")
}

export async function getAuthenticatedUser(): Promise<{ email: string } | null> {
  const token = cookies().get("auth-token")?.value
  if (!token) return null
  return verifyToken(token)
}

export async function requireAuth(): Promise<{ email: string }> {
  const user = await getAuthenticatedUser()
  if (!user) {
    redirect("/auth/login")
  }
  return user
}

// Re-export Next.js redirect helper for modules that import it from "@/lib/auth"
export { redirect } from "next/navigation"
