"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3 } from "lucide-react"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <BarChart3 className="h-6 w-6 text-primary" />
        <span className="hidden font-bold sm:inline-block">GroupPulse</span>
      </Link>
      <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
        <Link
          href="/dashboard"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/dashboard" ? "text-foreground" : "text-muted-foreground",
          )}
        >
          Dashboard
        </Link>
        <Link
          href="/sessions"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/sessions" || pathname.startsWith("/sessions/") ? "text-foreground" : "text-muted-foreground",
          )}
        >
          Sessions
        </Link>
        <Link
          href="/analytics"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/analytics" ? "text-foreground" : "text-muted-foreground",
          )}
        >
          Analytics
        </Link>
      </nav>
    </div>
  )
}
