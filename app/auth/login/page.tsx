"use client"

import { useActionState } from "react"
import { login } from "@/app/actions/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, undefined)

  return (
    <div className="min-h-screen bg-black text-white font-sf-mono relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Flying Character Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Flying character 1 */}
        <div className="absolute animate-[fly1_20s_linear_infinite] opacity-10">
          <div className="w-8 h-8 bg-white rounded-full relative">
            <div className="absolute -left-2 -right-2 top-1 h-1 bg-white rounded-full animate-pulse"></div>
            <div className="absolute -left-1 -right-1 top-3 h-0.5 bg-white rounded-full animate-pulse delay-100"></div>
          </div>
        </div>

        {/* Flying character 2 */}
        <div className="absolute animate-[fly2_25s_linear_infinite] opacity-10">
          <div className="w-6 h-6 bg-gray-400 rounded-full relative">
            <div className="absolute -left-1.5 -right-1.5 top-1 h-0.5 bg-gray-400 rounded-full animate-pulse delay-200"></div>
            <div className="absolute -left-1 -right-1 top-2.5 h-0.5 bg-gray-400 rounded-full animate-pulse delay-300"></div>
          </div>
        </div>

        {/* Flying character 3 */}
        <div className="absolute animate-[fly3_30s_linear_infinite] opacity-10">
          <div className="w-10 h-10 bg-white rounded-full relative">
            <div className="absolute -left-3 -right-3 top-2 h-1 bg-white rounded-full animate-pulse delay-500"></div>
            <div className="absolute -left-2 -right-2 top-4 h-0.5 bg-white rounded-full animate-pulse delay-600"></div>
          </div>
        </div>

        {/* Floating particles */}
        <div className="absolute animate-[float1_15s_ease-in-out_infinite] opacity-20">
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        </div>
        <div className="absolute animate-[float2_18s_ease-in-out_infinite] opacity-20">
          <div className="w-1 h-1 bg-white rounded-full"></div>
        </div>
        <div className="absolute animate-[float3_22s_ease-in-out_infinite] opacity-20">
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
        </div>
      </div>

      <Card className="w-full max-w-md border border-gray-800 bg-black/50 backdrop-blur-sm relative z-10">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-white text-center">Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-white"
              />
            </div>
            {state?.message && <p className="text-sm text-center text-red-400">{state.message}</p>}
            <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
          <div className="text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link href="/auth/register" className="font-medium text-white hover:underline">
              Register
            </Link>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
      @keyframes fly1 {
        0% { transform: translate(-100px, 20vh) rotate(0deg); }
        25% { transform: translate(25vw, 10vh) rotate(90deg); }
        50% { transform: translate(50vw, 30vh) rotate(180deg); }
        75% { transform: translate(75vw, 15vh) rotate(270deg); }
        100% { transform: translate(calc(100vw + 100px), 25vh) rotate(360deg); }
      }
      
      @keyframes fly2 {
        0% { transform: translate(calc(100vw + 100px), 60vh) rotate(180deg); }
        25% { transform: translate(75vw, 70vh) rotate(270deg); }
        50% { transform: translate(50vw, 50vh) rotate(360deg); }
        75% { transform: translate(25vw, 80vh) rotate(450deg); }
        100% { transform: translate(-100px, 65vh) rotate(540deg); }
      }
      
      @keyframes fly3 {
        0% { transform: translate(-100px, 40vh) rotate(0deg); }
        33% { transform: translate(33vw, 80vh) rotate(120deg); }
        66% { transform: translate(66vw, 20vh) rotate(240deg); }
        100% { transform: translate(calc(100vw + 100px), 60vh) rotate(360deg); }
      }
      
      @keyframes float1 {
        0%, 100% { transform: translate(10vw, 20vh) translateY(0px); }
        50% { transform: translate(15vw, 25vh) translateY(-20px); }
      }
      
      @keyframes float2 {
        0%, 100% { transform: translate(80vw, 70vh) translateY(0px); }
        50% { transform: translate(85vw, 65vh) translateY(-15px); }
      }
      
      @keyframes float3 {
        0%, 100% { transform: translate(60vw, 90vh) translateY(0px); }
        50% { transform: translate(65vw, 85vh) translateY(-25px); }
      }
    `}</style>
    </div>
  )
}
