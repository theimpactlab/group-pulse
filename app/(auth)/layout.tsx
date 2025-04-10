import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication - GroupPulse",
  description: "Sign in or register for GroupPulse",
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <div className="min-h-screen bg-gray-50">{children}</div>
}
