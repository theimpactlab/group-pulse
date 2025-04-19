"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, BarChart3 } from "lucide-react"
import { toast } from "sonner"
import { useEffect } from "react"

export default function JoinSessionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sessionCode, setSessionCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [participantName, setParticipantName] = useState("")
  const [sessionData, setSessionData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Check for code in query params
  useEffect(() => {
    const code = searchParams.get("code")
    if (code) {
      setSessionCode(code)
      fetchSession(code)
    }
  }, [searchParams])

  const fetchSession = async (code: string) => {
    if (!code.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      // Try to fetch the session
      const response = await fetch(`/api/public/sessions/${code}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to load session")
      }

      const data = await response.json()
      setSessionData(data)
      toast.success(`Session "${data.title}" found!`)
    } catch (err: any) {
      console.error("Error fetching session:", err)
      setError(err.message || "Failed to load session. Please check the session code and try again.")
      toast.error("Session not found. Please check the code and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!sessionCode.trim()) {
      toast.error("Please enter a session code")
      return
    }

    if (sessionData) {
      // If we already have session data, proceed to join
      handleJoin(e)
    } else {
      // Otherwise fetch the session first
      await fetchSession(sessionCode)
    }
  }

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()

    if (!participantName.trim()) {
      toast.error("Please enter your name")
      return
    }

    setIsSubmitting(true)

    toast.success(`Joining as ${participantName}...`)

    // Redirect to participate page
    setTimeout(() => {
      router.push(`/participate/${sessionData.id}?name=${encodeURIComponent(participantName)}`)
    }, 1000)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-2 rounded-full w-12 h-12 flex items-center justify-center mb-4">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          {sessionData ? (
            <>
              <CardTitle>{sessionData.title}</CardTitle>
              {sessionData.description && <CardDescription className="mt-2">{sessionData.description}</CardDescription>}
            </>
          ) : (
            <>
              <CardTitle>Join a Session</CardTitle>
              <CardDescription>Enter the session code to join</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">{error}</div>}

          {sessionData ? (
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining...
                  </>
                ) : (
                  "Join Session"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Session Code</Label>
                <Input
                  id="code"
                  placeholder="Enter session code"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value)}
                  className="text-center text-lg font-bold tracking-wider uppercase"
                  maxLength={10}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finding Session...
                  </>
                ) : (
                  "Find Session"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
