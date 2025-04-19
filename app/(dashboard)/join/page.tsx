"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, BarChart3 } from "lucide-react"
import { toast } from "sonner"

export default function JoinSessionPage() {
  const router = useRouter()
  const [sessionCode, setSessionCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!sessionCode.trim()) {
      toast.error("Please enter a session code")
      return
    }

    setIsSubmitting(true)

    try {
      // First try to fetch by code
      const response = await fetch(`/api/public/sessions/${sessionCode}`)

      if (!response.ok) {
        throw new Error("Session not found. Please check the code and try again.")
      }

      const data = await response.json()

      // Redirect to the participate page with the session ID
      router.push(`/participate/${data.id}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to join session")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-2 rounded-full w-12 h-12 flex items-center justify-center mb-4">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Join a Session</CardTitle>
          <CardDescription>Enter the session code to join</CardDescription>
        </CardHeader>
        <CardContent>
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
