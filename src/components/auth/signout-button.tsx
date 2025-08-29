"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { signOutClient } from "@/lib/auth-client"

export function SignOutButton() {
  const handleSignOut = async () => {
    await signOutClient()
  }

  return (
    <Button 
      onClick={handleSignOut}
      variant="outline" 
      size="sm"
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </Button>
  )
} 