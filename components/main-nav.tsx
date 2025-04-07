"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3 } from "lucide-react"
import { UserMenu } from "./user-menu"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

export function MainNav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isActive = (path: string) => {
    // Update this to handle route groups
    return pathname.endsWith(path) || pathname.includes(`${path}/`)
  }

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">GroupPulse</h1>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/dashboard"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/dashboard") && "text-primary",
            )}
          >
            Dashboard
          </Link>
          <Link
            href="/sessions"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/sessions") && "text-primary",
            )}
          >
            Sessions
          </Link>
          <Link
            href="/analytics"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/analytics") && "text-primary",
            )}
          >
            Analytics
          </Link>
          <Link
            href="/settings"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/settings") && "text-primary",
            )}
          >
            Settings
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <UserMenu user={session?.user} />
        </div>
      </div>
    </header>
  )
}

