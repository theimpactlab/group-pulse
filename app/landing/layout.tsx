import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "GroupPulse - Interactive Audience Engagement Platform",
  description:
    "Create interactive polls, quizzes, and Q&As that captivate your audience and provide valuable insights.",
}

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
