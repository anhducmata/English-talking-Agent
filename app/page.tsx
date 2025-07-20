import { requireAuth } from "@/lib/auth"
import HomePageClient from "@/components/home-page-client"

/**
 * Server Component
 * – Authenticates the request
 * – Passes the user’s e-mail to the client-side shell
 */
export default async function HomePage() {
  const user = await requireAuth() // safe: runs on the server
  return <HomePageClient userEmail={user.email} />
}
