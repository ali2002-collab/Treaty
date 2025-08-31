"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Container } from "@/components/ui/container"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/30 shadow-2xl"
          : "bg-background/40 backdrop-blur-md"
      }`}
    >
      <Container>
        <nav className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-foreground">Treaty</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/signin">
              <Button size="sm" className="px-6 py-2 h-9 bg-foreground text-background hover:bg-foreground/90 shadow-sm hover:shadow-md transition-all duration-200">
                Sign in
              </Button>
            </Link>
          </div>
        </nav>
      </Container>
    </header>
  )
} 