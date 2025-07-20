"use client"

import { useActionState } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Globe, Mail, Lock, LogIn } from "lucide-react"
import { login } from "@/app/actions/auth"

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null)

  // Redirect on successful login
  if (state?.success) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-2xl font-bold">English Practice</h1>
          </div>
          <p className="text-gray-400">Welcome back! Sign in to continue</p>
        </div>

        {/* Login Form */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <LogIn className="w-5 h-5" />
              Sign In
            </CardTitle>
            <CardDescription className="text-gray-400">Access your English practice dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              {state?.error && (
                <Alert className="border-red-800 bg-red-900/20">
                  <AlertDescription className="text-red-400">{state.error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {isPending ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link href="/auth/forgot-password" className="text-blue-400 hover:text-blue-300 text-sm">
                  Forgot your password?
                </Link>
              </div>

              <div className="text-center">
                <p className="text-gray-400">
                  Don't have an account?{" "}
                  <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 font-medium">
                    Create one
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Account */}
        <div className="mt-6 p-4 bg-gray-900/30 rounded-lg border border-gray-800">
          <p className="text-gray-400 text-sm text-center mb-2">Demo Account (for testing):</p>
          <p className="text-gray-300 text-xs text-center">
            Email: demo@example.com
            <br />
            Password: demo123
          </p>
        </div>
      </div>
    </div>
  )
}
