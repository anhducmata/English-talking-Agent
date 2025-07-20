import { requireAuth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { logout } from "@/app/actions/auth"
import { Shield, User } from "lucide-react"

export default async function ProtectedPage() {
  const user = await requireAuth()

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Protected Area</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">Logged in as:</span>
            </div>
            <p className="text-white font-medium">{user.email}</p>
          </div>
          <div className="text-center text-gray-400 text-sm">
            This is a protected page that requires authentication to access.
          </div>
          <form action={logout} className="w-full">
            <Button
              type="submit"
              variant="outline"
              className="w-full border-gray-600 text-white hover:bg-gray-800 bg-transparent"
            >
              Logout
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
