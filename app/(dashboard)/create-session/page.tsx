"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"
import { generateSessionCode } from "@/lib/session-utils"

export default function CreateSessionPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error("Please provide a title for your session")
      return
    }

    if (!session?.user?.id) {
      toast.error("You must be logged in to create a session")
      return
    }

    setIsCreating(true)

    try {
      // Generate a unique session ID and code
      const sessionId = uuidv4()
      const sessionCode = generateSessionCode(6)

      // Create the session
      const { error } = await supabase.from("sessions").insert([
        {
          id: sessionId,
          title: title.trim(),
          description: description.trim() || null,
          user_id: session.user.id,
          status: "draft",
          content: [],
          code: sessionCode,
        },
      ])

      if (error) {
        throw error
      }

      toast.success("Session created successfully")
      router.push(`/sessions/${sessionId}/edit`)
    } catch (err: any) {
      console.error("Error creating session:", err)
      toast.error(err.message || "Failed to create session")
      setIsCreating(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container py-6">
        <h1 className="text-3xl font-bold mb-6">Create New Session</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
              <CardDescription>Enter the basic information for your new session</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSession} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Session Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for your session"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter a description for your session"
                    rows={4}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                    </>
                  ) : (
                    "Create Session"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What happens next?</CardTitle>
                <CardDescription>After creating your session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  After creating your session, you'll be able to add interactive elements like polls, quizzes, and word
                  clouds.
                </p>
                <p>You can then present your session to participants who can join using a unique code or link.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Types</CardTitle>
                <CardDescription>Available interaction types</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Multiple Choice Polls</li>
                  <li>Word Clouds</li>
                  <li>Q&A Sessions</li>
                  <li>Quizzes</li>
                  <li>Rating Scales</li>
                  <li>Open-ended Questions</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
