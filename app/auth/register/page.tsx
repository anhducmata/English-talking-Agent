"use client"
import { useActionState } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Globe, Mail, Lock, User } from "lucide-react"
import { register } from "@/app/actions/auth"

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, null)

  // Redirect on successful registration
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
          <p className="text-gray-400">Create your account to start practicing</p>
        </div>

        {/* Registration Form */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="w-5 h-5" />
              Create Account
            </CardTitle>
            <CardDescription className="text-gray-400">
              Join thousands of learners improving their English
            </CardDescription>
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
                    placeholder="Create a password"
                    required
                    minLength={6}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-400">Password must be at least 6 characters long</p>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {isPending ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm mb-4">What you'll get:</p>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center justify-center gap-2 text-gray-300">
              <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
              AI-powered conversation practice
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-300">
              <div className="w-1 h-1 bg-green-400 rounded-full"></div>
              Real-time pronunciation feedback
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-300">
              <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
              Progress tracking and analytics
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
