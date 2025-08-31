import { Container } from "@/components/ui/container"
import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/50 bg-gradient-to-br from-muted/50 via-muted/30 to-background">
      <Container>
        <div className="flex flex-col md:flex-row items-center justify-between py-8 px-4">
          {/* Left side - Copyright */}
          <div className="text-sm text-muted-foreground mb-4 md:mb-0 text-center md:text-left">
            © {currentYear} Treaty. All rights reserved.
          </div>

          {/* Right side - Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  )
} 