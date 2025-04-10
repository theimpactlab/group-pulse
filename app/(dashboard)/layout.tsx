import type React from "react"
import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: "Dashboard - GroupPulse",
  description: "Manage your interactive sessions",
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      {children}
      <Toaster position="top-right" />
    </div>
  )
}
