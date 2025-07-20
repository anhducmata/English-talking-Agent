"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { logout } from "@/app/actions/auth"
import { use } from "react"

interface Props {
  emailPromise: Promise<string | undefined>
}

export function UserProfileDropdown({ emailPromise }: Props) {
  // This hook lets Server Components pass data down; falls back to “User”.
  const email = use(emailPromise) ?? "User"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarFallback>{email[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="pointer-events-none">{email}</DropdownMenuItem>
        <form action={logout}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full text-left">
              Log out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
