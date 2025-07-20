"use client"

import { useActionState } from "react"
import { login } from "@/app/actions/auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, { message: "", success: false })

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <Input name="email" type="email" placeholder="Email" required />
            <Input name="password" type="password" placeholder="Password" required />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Signing in…" : "Login"}
            </Button>
          </form>

          {state.message && (
            <p className={`mt-4 text-sm ${state.success ? "text-green-600" : "text-red-600"}`}>{state.message}</p>
          )}

          <p className="mt-6 text-center text-sm">
            Need an account?{" "}
            <Link href="/auth/register" className="underline">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
