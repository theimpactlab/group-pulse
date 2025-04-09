"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, Share2, QrCode } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

export default function PresentSessionPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [sessionData, setSessionData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [joinUrl, setJoinUrl] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/login"
    } else if (status === "authenticated") {
      fetchSession()
    }
  }, [status, params.id])

  useEffect(() => {
    // Set the join URL
    const baseUrl = window.location.origin
    setJoinUrl(`${baseUrl}/join/${params.id}`)
  }, [params.id])

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
          <h1 className="text-3xl font-bold">Present: {sessionData.title}</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Join Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Join URL</h3>
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 p-2 rounded flex-1 overflow-x-auto">{joinUrl}</code>
                  <Button variant="outline" size="sm" onClick={copyJoinLink}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="text-center mt-6">
                <div className="bg-white p-4 inline-block rounded-lg border">
                  <QrCode className="h-32 w-32 mx-auto text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mt-2">Scan to join</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Content</CardTitle>
            </CardHeader>
            <CardContent>
              {sessionData.content && sessionData.content.length > 0 ? (
                <div className="space-y-4">
                  <p>This session has {sessionData.content.length} content items.</p>
                  <Button asChild>
                    <Link href={`/sessions/${params.id}/edit`}>Edit Content</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No content has been added to this session yet.</p>
                  <Button asChild>
                    <Link href={`/sessions/${params.id}/edit`}>Add Content</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
