import { requireAuth } from "@/lib/auth"

export default async function ProtectedPage() {
  const { email } = await requireAuth()

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-2xl">This is a protected page visible only to {email}.</p>
    </main>
  )
}
