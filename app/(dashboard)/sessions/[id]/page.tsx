"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, Share2, Trash2 } from "lucide-react"
import { MainNav } from "@/components/main-nav"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function SessionPage() {
  const router = useRouter()
  const params = useParams()
  const sessionData = useSession()
  const session = sessionData?.data
  const [isLoading, setIsLoading] = useState(true)
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

        setSessionInfo(data)
      } catch (err) {
        console.error("Error fetching session:", err)
        setError("Failed to load session. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchSession()
    } else if (sessionData.status === "unauthenticated") {
      setIsLoading(false)
      setError("Please log in to view this session")
    }
  }, [session, params.id, sessionData.status])

  const handleShare = () => {
    // Generate a shareable link
    const shareableLink = `${window.location.origin}/join/${params.id}`

    // Copy to clipboard
    try {
      navigator.clipboard.writeText(shareableLink)
      console.log("Link copied:", shareableLink)
      toast.success("Link copied to clipboard!")
    } catch (err) {
      console.error("Failed to copy link:", err)
      // Fallback method for clipboard
      const textArea = document.createElement("textarea")
      textArea.value = shareableLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      toast.success("Link copied to clipboard!")
    }
  }

  const handleDeleteSession = async () => {
    try {
      setIsDeleting(true)

      // Since RLS is disabled, we can use the Supabase client directly
      const { error } = await supabase.from("sessions").delete().eq("id", params.id)

      if (error) throw error

      toast.success("Session deleted successfully")

      // Redirect to the sessions list
      router.push("/sessions")
    } catch (err: any) {
      console.error("Error deleting session:", err)
      toast.error("Failed to delete the session. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const activateSession = async () => {
    try {
      const { error } = await supabase.from("sessions").update({ status: "active" }).eq("id", params.id)

      if (error) throw error

      // Update the local state
      setSessionInfo({
        ...sessionInfo,
        status: "active",
      })

      toast.success("Session activated successfully")
    } catch (err: any) {
      console.error("Error activating session:", err)
      toast.error("Failed to activate the session. Please try again.")
    }
  }

  // Show loading state if session is still loading
  if (sessionData.status === "loading" || (isLoading && !error)) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 container py-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (sessionData.status === "unauthenticated") {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 container py-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h2 className="text-xl font-semibold mb-2">Please log in to view this session</h2>
            <p className="text-muted-foreground mb-6">You need to be logged in to access this page.</p>
            <Button onClick={() => router.push("/login")}>Log In</Button>
          </div>
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

  if (!sessionInfo) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 container py-6">
          <div className="bg-yellow-50 text-yellow-600 p-4 rounded-md">Session not found</div>
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
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.push("/sessions")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{sessionInfo.title}</h1>
            {sessionInfo.description && <p className="text-muted-foreground">{sessionInfo.description}</p>}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Session Content</CardTitle>
                <CardDescription>
                  This session contains {sessionInfo.content.length} interactive element(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessionInfo.content.map((element: any, index: number) => (
                    <div key={element.id} className="p-4 border rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">
                          {element.type === "multiple-choice" && `Poll: ${element.data.question}`}
                          {element.type === "word-cloud" && `Word Cloud: ${element.data.question}`}
                          {element.type === "open-ended" && `Open-ended: ${element.data.question}`}
                          {element.type === "scale" && `Scale: ${element.data.question}`}
                          {element.type === "ranking" && `Ranking: ${element.data.question}`}
                          {element.type === "qa" && `Q&A: ${element.data.title}`}
                          {element.type === "quiz" && `Quiz: ${element.data.question}`}
                          {element.type === "image-choice" && `Image Choice: ${element.data.question}`}
                        </div>
                        <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {element.type.replace(/-/g, " ").toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))}

                  {sessionInfo.content.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No content yet. Add interactive elements to your session.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Share Session</CardTitle>
                <CardDescription>Share this session with your audience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Session Status</div>
                  <div
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      sessionInfo.status === "active" ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    {sessionInfo.status === "active" ? "Active" : "Draft"}
                  </div>
                </div>

                {sessionInfo.status !== "active" && (
                  <Button className="w-full" variant="outline" onClick={activateSession}>
                    Activate Session
                  </Button>
                )}

                <Button className="w-full gap-2" onClick={handleShare}>
                  <Share2 className="h-4 w-4" /> Copy Join Link
                </Button>

                <div className="mt-4 p-3 bg-muted rounded-md text-center">
                  <div className="text-2xl font-bold mb-1">{params.id.toString().substring(0, 6).toUpperCase()}</div>
                  <div className="text-xs text-muted-foreground">Session Code</div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>Actions that cannot be undone</CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full gap-2">
                      <Trash2 className="h-4 w-4" /> Delete Session
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the session and all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteSession}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting...
                          </>
                        ) : (
                          "Delete"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => router.push(`/sessions/${params.id}/edit`)}>
                Edit
              </Button>
              <Button className="flex-1" onClick={() => router.push(`/sessions/${params.id}/present`)}>
                Present
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push(`/sessions/${params.id}/results`)}
              >
                Results
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

