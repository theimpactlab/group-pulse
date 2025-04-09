"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, Share2, Play } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

export default function SessionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [sessionData, setSessionData] = useState<any>(null)
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
    } catch (error) {
      console.error("Error fetching session:", error)
      setError("Failed to load session")
    } finally {
      setIsLoading(false)
    }
  }

  const copyJoinLink = () => {
    const baseUrl = window.location.origin
    const joinUrl = `${baseUrl}/join/${params.id}`

    navigator.clipboard
      .writeText(joinUrl)
      .then(() => toast.success("Join link copied to clipboard"))
      .catch(() => toast.error("Failed to copy link"))
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
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{sessionData.title}</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Session Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Description</h3>
                    <p className="text-muted-foreground">{sessionData.description || "No description provided"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Status</h3>
                    <p className="text-muted-foreground capitalize">{sessionData.status}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Content</h3>
                    <p className="text-muted-foreground">{sessionData.content?.length || 0} item(s)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" asChild>
                  <Link href={`/sessions/${params.id}/edit`}>Edit Session</Link>
                </Button>
                <Button className="w-full" variant="outline" onClick={copyJoinLink}>
                  <Share2 className="h-4 w-4 mr-2" /> Share Join Link
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link href={`/sessions/${params.id}/present`}>
                    <Play className="h-4 w-4 mr-2" /> Present
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
