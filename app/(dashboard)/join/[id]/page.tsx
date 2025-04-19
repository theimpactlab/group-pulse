"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, BarChart3 } from "lucide-react"
import { toast } from "sonner"

export default function JoinSessionPage() {
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [sessionData, setSessionData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [participantName, setParticipantName] = useState("")
  const [isJoining, setIsJoining] = useState(false)

  useEffect(() => {
    async function fetchSession() {
      if (!params.id) return

      try {
        setIsLoading(true)

        // First try to fetch by code (if it's a short code)
        if (params.id.length <= 6) {
          const codeResponse = await fetch(`/api/public/sessions/code/${params.id}`)

          if (codeResponse.ok) {
            const data = await codeResponse.json()
            setSessionData(data)
            toast.success(`Session "${data.title}" found!`)
            setIsLoading(false)
            return
          }
        }

        // If not found by code or it's a UUID, try the regular session endpoint
        const response = await fetch(`/api/public/sessions/${params.id}`)

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

    fetchSession()
  }, [params.id])

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsJoining(true)

    toast.success(`Joining as ${participantName}...`)

    // Simulate joining
    setTimeout(() => {
      window.location.href = `/participate/${sessionData.id}?name=${encodeURIComponent(participantName)}`
    }, 1000)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Session Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
              <p>Please check the session code and try again.</p>
            </div>
          </CardContent>
        </Card>
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
          <CardTitle>{sessionData.title}</CardTitle>
          {sessionData.description && <CardDescription className="mt-2">{sessionData.description}</CardDescription>}
        </CardHeader>
        <CardContent>
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
            <Button type="submit" className="w-full" disabled={isJoining || !participantName.trim()}>
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining...
                </>
              ) : (
                "Join Session"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
