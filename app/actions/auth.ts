"use server"

import { hashPassword, comparePassword, generateToken, setAuthCookie, clearAuthCookie } from "@/lib/auth"
import { findUserByEmail, createUser } from "@/lib/db"
import { redirect } from "next/navigation"

export async function register(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { message: "Email and password are required.", success: false }
  }

  if (password.length < 6) {
    return { message: "Password must be at least 6 characters long.", success: false }
  }

  const existingUser = await findUserByEmail(email)
  if (existingUser) {
    return { message: "User with this email already exists.", success: false }
  }

  try {
    const hashedPassword = await hashPassword(password)
    const newUser = await createUser(email, hashedPassword)

    if (!newUser) {
      return { message: "Failed to register user.", success: false }
    }

    return { message: "Registration successful! Please log in.", success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return { message: "An unexpected error occurred during registration.", success: false }
  }
}

export async function login(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { message: "Email and password are required.", success: false }
  }

  try {
    const user = await findUserByEmail(email)
    if (!user) {
      return { message: "Invalid credentials.", success: false }
    }

    const passwordMatch = await comparePassword(password, user.hashedPassword)
    if (!passwordMatch) {
      return { message: "Invalid credentials.", success: false }
    }

    const token = await generateToken({ email: user.email })
    await setAuthCookie(token)

    redirect("/") // Redirect to the main page after successful login
  } catch (error) {
    console.error("Login error:", error)
    // Check if the error is a redirect error, re-throw it
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error
    }
    return { message: "An unexpected error occurred during login.", success: false }
  }
}

export async function logout() {
  await clearAuthCookie()
  redirect("/auth/login")
}
