"use client"

import { requireAuth } from "@/lib/auth"
import { HomePageClient } from "@/components/home-page-client"

export default async function HomePage() {
  const user = await requireAuth()

  return <HomePageClient userEmail={user.email} />
}
