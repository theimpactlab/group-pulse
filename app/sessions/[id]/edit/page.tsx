"use client"

import Link from "next/link"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

export default function EditSessionPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [sessionData, setSessionData] = useState<any>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/login"
    } else if (status === "authenticated") {
      fetchSession()
    }
  }, [status, params.id])

  const fetchSession = async () => {
    try {
      const { data, error } = await supabase.from("sessions").select("*").eq("id", params.id).single()

      if (error) throw error

      if (!data) {
        setError("Session not found")
        return
      }

      // Check if the session belongs to the current user
      if (data.user_id !== session?.user?.id) {
        setError("You don't have access to this session")
        return
      }

      setSessionData(data)
      setTitle(data.title)
      setDescription(data.description || "")
    } catch (error) {
      console.error("Error fetching session:", error)
      setError("Failed to load session")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required")
      return
    }

    setIsSaving(true)

    try {
      const { error } = await supabase
        .from("sessions")
        .update({
          title: title.trim(),
          description: description.trim() || null,
        })
        .eq("id", params.id)

      if (error) throw error

      toast.success("Session updated successfully")
      router.push(`/sessions/${params.id}`)
    } catch (error) {
      console.error("Error updating session:", error)
      toast.error("Failed to update session")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 container py-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 container py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Error</h1>
          </div>

          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Session Error</h3>
                <p className="text-muted-foreground mb-8">{error}</p>
                <Button asChild>
                  <Link href="/sessions">Back to Sessions</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Edit Session</h1>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
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
      </main>
    </div>
  )
}
