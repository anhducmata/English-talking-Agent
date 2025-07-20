"use server"

import { hashPassword, comparePassword, generateToken, setAuthCookie, clearAuthCookie } from "@/lib/auth"
import { createUser, findUserByEmail } from "@/lib/db"
import { redirect } from "next/navigation"

export async function register(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long" }
  }

  // Check if user already exists
  const existingUser = await findUserByEmail(email)
  if (existingUser) {
    return { error: "User with this email already exists" }
  }

  // Hash password and create user
  const hashedPassword = await hashPassword(password)
  const user = await createUser(email, hashedPassword)

  if (!user) {
    return { error: "Failed to create user" }
  }

  // Generate token and set cookie
  const token = await generateToken({ email })
  await setAuthCookie(token)

  redirect("/")
}

export async function login(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  // Find user
  const user = await findUserByEmail(email)
  if (!user) {
    return { error: "Invalid email or password" }
  }

  // Verify password
  const isValidPassword = await comparePassword(password, user.password_hash)
  if (!isValidPassword) {
    return { error: "Invalid email or password" }
  }

  // Generate token and set cookie
  const token = await generateToken({ email })
  await setAuthCookie(token)

  redirect("/")
}

export async function logout() {
  await clearAuthCookie()
  redirect("/auth/login")
}
