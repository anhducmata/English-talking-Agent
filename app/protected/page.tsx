import { requireAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, User, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

export default async function ProtectedPage() {
  const user = await requireAuth()

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl font-bold">Protected Area</h1>
          </div>
          <p className="text-gray-400 text-lg">This page is only accessible to authenticated users</p>
        </div>

        {/* User Info Card */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              User Information
            </CardTitle>
            <CardDescription className="text-gray-400">Your authenticated session details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Email Address</span>
              <span className="text-white font-medium">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Authentication Status</span>
              <Badge className="bg-green-600 text-white">
                <CheckCircle className="w-3 h-3 mr-1" />
                Authenticated
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Session Type</span>
              <Badge variant="outline" className="border-blue-600 text-blue-400">
                JWT Token
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Access Level</span>
              <Badge variant="outline" className="border-purple-600 text-purple-400">
                Full Access
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">Secure Access</h3>
              <p className="text-gray-400 text-sm">Your session is protected with JWT authentication</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Clock className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">Session Management</h3>
              <p className="text-gray-400 text-sm">Automatic session handling with secure cookies</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <User className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">User Profile</h3>
              <p className="text-gray-400 text-sm">Personalized experience based on your preferences</p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
