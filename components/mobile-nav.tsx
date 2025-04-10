"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  // Force close the menu when clicking a link
  const handleLinkClick = () => {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
          aria-label="Toggle Menu"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0 w-[75%] max-w-[280px] sm:max-w-sm">
        <div className="px-2 py-4">
          <Link href="/" className="flex items-center mb-4" onClick={handleLinkClick}>
            <span className="font-bold text-lg">GroupPulse</span>
          </Link>
          <nav className="flex flex-col space-y-4">
            <Link
              href="/dashboard"
              onClick={handleLinkClick}
              className={cn(
                "flex items-center px-3 py-2 text-base rounded-md transition-colors",
                pathname === "/dashboard"
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              Dashboard
            </Link>
            <Link
              href="/sessions"
              onClick={handleLinkClick}
              className={cn(
                "flex items-center px-3 py-2 text-base rounded-md transition-colors",
                pathname === "/sessions" || pathname.startsWith("/sessions/")
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              Sessions
            </Link>
            <Link
              href="/analytics"
              onClick={handleLinkClick}
              className={cn(
                "flex items-center px-3 py-2 text-base rounded-md transition-colors",
                pathname === "/analytics"
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              Analytics
            </Link>
            <Link
              href="/settings/profile"
              onClick={handleLinkClick}
              className={cn(
                "flex items-center px-3 py-2 text-base rounded-md transition-colors",
                pathname.startsWith("/settings")
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              Settings
            </Link>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}
