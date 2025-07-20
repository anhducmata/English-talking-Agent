import { requireAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, User, Clock, Key } from "lucide-react"

export default async function ProtectedPage() {
  const user = await requireAuth()

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Protected Area</h1>
          <p className="text-gray-400">This page is only accessible to authenticated users</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white/5 backdrop-blur-sm border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                User Information
              </CardTitle>
              <CardDescription className="text-gray-400">Your authenticated session details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Email Address</label>
                <p className="text-white font-medium">{user.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Account Status</label>
                <div className="mt-1">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Key className="w-5 h-5" />
                Security Features
              </CardTitle>
              <CardDescription className="text-gray-400">Authentication and security measures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">JWT Authentication</span>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">HTTP-Only Cookies</span>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Password Encryption</span>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">bcrypt</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Route Protection</span>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Middleware</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/5 backdrop-blur-sm border-gray-800 mt-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Session Information
            </CardTitle>
            <CardDescription className="text-gray-400">Details about your current session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400">Session Type</label>
                <p className="text-white font-medium">JWT Token</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Token Expiry</label>
                <p className="text-white font-medium">7 days</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Storage Method</label>
                <p className="text-white font-medium">HTTP-Only Cookie</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
