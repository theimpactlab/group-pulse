"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { v4 as uuidv4 } from "uuid"
import { supabase } from "@/lib/supabase"
import { ThemeSelector } from "@/components/theme-selector"
import { useTheme } from "@/contexts/theme-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CreateSessionPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { themes } = useTheme()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedThemeId, setSelectedThemeId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  // Set default theme when themes are loaded
  useEffect(() => {
    if (themes && themes.length > 0 && !selectedThemeId) {
      setSelectedThemeId(themes[0].id)
    }
  }, [themes, selectedThemeId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setDebugInfo(null)

    if (!session?.user?.id) {
      setError("You must be logged in to create a session")
      return
    }

    if (!title.trim()) {
      setError("Please provide a title for your session")
      return
    }

    setIsSubmitting(true)

    try {
      // Create a debug object to help troubleshoot
      const debug = {
        userId: session.user.id,
        selectedThemeId,
        availableThemes: themes.map((t) => ({ id: t.id, name: t.name })),
      }

      // Create the new session object
      const newSession: any = {
        id: uuidv4(),
        title: title.trim(),
        description: description.trim() || null,
        user_id: session.user.id,
        status: "draft", // Set to draft by default
        content: [],
      }

      // Only add theme_id if it's a valid UUID
      // Skip adding theme_id if it's one of the default themes with non-UUID IDs
      if (
        selectedThemeId &&
        selectedThemeId !== "default" &&
        selectedThemeId !== "dark" &&
        selectedThemeId !== "corporate" &&
        selectedThemeId !== "playful" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedThemeId)
      ) {
        newSession.theme_id = selectedThemeId
      }

      debug.newSession = newSession

      // Insert the session
      const { data, error } = await supabase.from("sessions").insert([newSession]).select()

      debug.insertResult = { data, error }

      if (error) {
        setDebugInfo(debug)
        throw error
      }

      toast.success("Session created successfully")
      router.push("/sessions")
    } catch (error: any) {
      console.error("Error creating session:", error)
      setError(`Failed to create session: ${error.message || "Unknown error"}`)
      setDebugInfo((prev) => ({ ...prev, error }))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Create New Session</h1>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
            <CardDescription>Provide basic information about your interactive session</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Session Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a title for your session"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Enter a description for your session"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <ThemeSelector
                  selectedThemeId={selectedThemeId}
                  onSelect={(theme) => {
                    console.log("Selected theme:", theme)
                    setSelectedThemeId(theme.id)
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  {selectedThemeId &&
                  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedThemeId)
                    ? "Using custom theme"
                    : "Using default theme"}
                </p>
              </div>

              {debugInfo && (
                <div className="mt-4 p-4 bg-gray-100 rounded-md overflow-auto text-xs">
                  <details>
                    <summary className="cursor-pointer font-medium">Debug Information</summary>
                    <pre className="mt-2">{JSON.stringify(debugInfo, null, 2)}</pre>
                  </details>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => router.push("/sessions")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                  </>
                ) : (
                  "Create Session"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  )
}
