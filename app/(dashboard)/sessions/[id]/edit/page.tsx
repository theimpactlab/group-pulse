"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import { PollTypeSelector } from "@/components/poll-type-selector"
import { PollEditor } from "@/components/poll-editor"
import { createPollTemplate } from "@/components/create-poll-template"
import type { PollType } from "@/types/poll-types"

export default function EditSessionPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [sessionData, setSessionData] = useState<any>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState<PollType[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSession() {
      if (!session?.user?.id || !params.id) return

      try {
        const { data, error } = await supabase.from("sessions").select("*").eq("id", params.id).single()

        if (error) throw error

        if (!data) {
          setError("Session not found")
          return
        }

        setSessionData(data)
        setTitle(data.title)
        setDescription(data.description || "")
        setContent(data.content || [])
      } catch (err) {
        console.error("Error fetching session:", err)
        setError("Failed to load session. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchSession()
    }
  }, [session, params.id])

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please provide a title for your session")
      return
    }

    setIsSaving(true)

    try {
      // Since RLS is disabled, we can use the Supabase client directly
      const { error } = await supabase
        .from("sessions")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          content: content,
        })
        .eq("id", params.id)

      if (error) throw error

      toast.success("Session saved successfully")

      // Redirect to the sessions list after saving
      router.push("/sessions")
    } catch (err: any) {
      console.error("Error updating session:", err)
      toast.error("Failed to save changes. Please try again.")
      setIsSaving(false)
    }
  }

  const handleAddPoll = (type: string) => {
    const newPoll = createPollTemplate(type)
    setContent([...content, newPoll])
  }

  const handlePollChange = (index: number, updatedPoll: PollType) => {
    const newContent = [...content]
    newContent[index] = updatedPoll
    setContent(newContent)
  }

  const handleDeletePoll = (index: number) => {
    const newContent = [...content]
    newContent.splice(index, 1)
    setContent(newContent)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 container py-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 container py-6">
          <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
          <Button className="mt-4" onClick={() => router.push("/sessions")}>
            Back to Sessions
          </Button>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 container py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push(`/sessions/${params.id}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Edit Session</h1>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Details</CardTitle>
                <CardDescription>Basic information about your session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Session Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for your session"
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Content</CardTitle>
                  <CardDescription>Interactive elements in your session</CardDescription>
                </div>
                <PollTypeSelector onSelect={handleAddPoll} />
              </CardHeader>
              <CardContent>
                {content.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No content yet. Add interactive elements to your session.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {content.map((poll, index) => (
                      <PollEditor
                        key={poll.id}
                        poll={poll}
                        onChange={(updatedPoll) => handlePollChange(index, updatedPoll)}
                        onDelete={() => handleDeletePoll(index)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Session Preview</CardTitle>
                <CardDescription>How your session will appear to participants</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-muted-foreground">Preview not available</p>
                </div>
                <Button className="mt-4 w-full" onClick={() => router.push(`/sessions/${params.id}/present`)}>
                  Present Session
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

