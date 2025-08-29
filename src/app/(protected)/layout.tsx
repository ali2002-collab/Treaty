import type { Metadata } from "next"
import { Container } from "@/components/ui/container"
import { SignOutButton } from "@/components/auth/signout-button"

export const metadata: Metadata = {
  title: "Dashboard — Treaty",
  description: "Your contract analysis dashboard",
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-xl">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <span className="text-xl font-bold text-foreground">Treaty</span>
            </div>
            <SignOutButton />
          </div>
        </Container>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
} 