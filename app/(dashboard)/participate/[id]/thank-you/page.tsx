"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, BarChart3 } from "lucide-react"
import { useColorScheme } from "@/hooks/use-color-scheme"
import { ThemeWrapper } from "../theme-wrapper"

export default function ThankYouPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [sessionData, setSessionData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const colorScheme = useColorScheme()

  const participantName = searchParams.get("name") || "Anonymous"
  const sessionId = params.id

  useEffect(() => {
    async function fetchSessionInfo() {
      if (!sessionId) return

      try {
        const response = await fetch(`/api/public/sessions/${sessionId}`)
        if (response.ok) {
          const data = await response.json()
          setSessionData(data)
        }
      } catch (error) {
        console.error("Error fetching session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessionInfo()
  }, [sessionId])

  return (
    <ThemeWrapper sessionId={sessionId as string}>
      <div className="flex min-h-screen flex-col">
        {/* Top bar */}
        <div
          style={{
            backgroundColor: "var(--theme-primary)",
            color: "#ffffff",
          }}
          className="p-4 transition-colors duration-300"
        >
          <div className="container flex justify-between items-center">
            <div className="font-medium" style={{ fontFamily: "var(--theme-font-heading)" }}>
              {sessionData?.title || "Session Complete"}
            </div>
            <div className="text-sm">Participant: {participantName}</div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 container py-12 flex items-center justify-center transition-colors duration-300">
          <Card
            className="w-full max-w-md shadow-lg text-center transition-colors duration-300"
            style={{
              borderColor: "var(--theme-border)",
              borderRadius: "var(--theme-radius)",
            }}
          >
            <CardHeader className="pb-2">
              <div
                className="mx-auto p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4"
                style={{
                  backgroundColor: "var(--theme-accent)",
                  color: "var(--theme-primary)",
                }}
              >
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl" style={{ fontFamily: "var(--theme-font-heading)" }}>
                Thank You!
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <p>Your responses have been submitted successfully. Thank you for participating in this session.</p>
              {sessionData?.status === "active" && (
                <div
                  className="mt-6 p-4 rounded-lg"
                  style={{
                    backgroundColor: "var(--theme-accent)",
                    color: "var(--theme-foreground)",
                  }}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5" />
                    <p className="font-medium">Results will be shared soon</p>
                  </div>
                  <p className="text-sm">The presenter may share the results of this session with you shortly.</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  // Try to close the window
                  window.close()
                  // Fallback if window.close() doesn't work (some browsers block it)
                  setTimeout(() => {
                    // If we're still here after trying to close, redirect to homepage
                    window.location.href = "/"
                  }, 300)
                }}
                className="mr-2"
              >
                Close Window
              </Button>
              <Button
                onClick={() => router.push(`/join/${sessionId}`)}
                style={{ backgroundColor: "var(--theme-primary)" }}
              >
                Rejoin Session
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    </ThemeWrapper>
  )
}
