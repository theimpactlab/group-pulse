"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { BarChart3, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { UserMenu } from "@/components/user-menu"

export function SiteHeader() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <span className="hidden font-bold sm:inline-block">GroupPulse</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
            Dashboard
          </Link>
          <Link href="/sessions" className="text-sm font-medium transition-colors hover:text-primary">
            Sessions
          </Link>
          <Link href="/analytics" className="text-sm font-medium transition-colors hover:text-primary">
            Analytics
          </Link>
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {session?.user ? (
              <UserMenu user={session.user} />
            ) : (
              <Button asChild size="sm">
                <Link href="/login">Login</Link>
              </Button>
            )}
          </nav>
        </div>

        {/* Mobile menu button */}
        <Button variant="ghost" className="md:hidden ml-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="absolute top-14 left-0 right-0 bg-background border-b shadow-lg z-50 md:hidden">
            <nav className="flex flex-col p-4 space-y-3">
              <Link
                href="/dashboard"
                className="text-sm font-medium px-3 py-2 rounded-md hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/sessions"
                className="text-sm font-medium px-3 py-2 rounded-md hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sessions
              </Link>
              <Link
                href="/analytics"
                className="text-sm font-medium px-3 py-2 rounded-md hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                Analytics
              </Link>
              <Link
                href="/settings"
                className="text-sm font-medium px-3 py-2 rounded-md hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                Settings
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
