"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BarChart3, Plus, Loader2, Trash2 } from 'lucide-react'
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
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

interface Session {
  id: string
  title: string
  description: string | null
  status: string
  created_at: string
  content: any[]
}

export default function SessionsPage() {
  // Fix the session handling to prevent errors during prerendering
  const sessionData = useSession()
  const session = sessionData?.data

  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSessions() {
      if (!session?.user?.id) {
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from("sessions")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        setSessions(data || [])
      } catch (err) {
        console.error("Error fetching sessions:", err)
        setError("Failed to load sessions. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchSessions()
    } else if (sessionData.status === "unauthenticated") {
      setIsLoading(false)
    }
  }, [session, sessionData.status])

  const handleDeleteSession = async (id: string) => {
    try {
      setDeletingSessionId(id)

      // Use the server-side API route for deletion which will also clean up images
      const response = await fetch(`/api/sessions/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to delete session")
      }

      // Update the sessions list by filtering out the deleted session
      setSessions(sessions.filter((session) => session.id !== id))

      // Use a string for the toast description instead of an object
      toast.success("Session deleted successfully")
    } catch (err: any) {
      console.error("Error deleting session:", err)
      // Make sure we're passing a string as the description
      toast.error(err.message || "Failed to delete the session. Please try again.")
    } finally {
      setDeletingSessionId(null)
    }
  }

  // Show loading state if session is still loading
  if (sessionData.status === "loading") {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 container py-6">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (sessionData.status === "unauthenticated") {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 container py-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h2 className="text-xl font-semibold mb-2">Please log in to view your sessions</h2>
            <p className="text-muted-foreground mb-6">You need to be logged in to access this page.</p>
            <Link href="/login">
              <Button>Log In</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Sessions</h1>
          <Link href="/create-session">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Create Session
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-primary/10 p-3 mb-4">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No sessions yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Create your first interactive session to engage with your audience in real-time.
            </p>
            <Link href="/create-session">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Create Your First Session
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{session.title}</CardTitle>
                      {session.description && <CardDescription className="mt-1">{session.description}</CardDescription>}
                    </div>
                    <div className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                      {session.status === "active" ? "Active" : "Draft"}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Created {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {session.content.filter((item) => item.type === "poll").length > 0 && (
                        <div className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                          {session.content.filter((item) => item.type === "poll").length} Poll(s)
                        </div>
                      )}
                      {session.content.filter((item) => item.type === "qa").length > 0 && (
                        <div className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">
                          {session.content.filter((item) => item.type === "qa").length} Q&A(s)
                        </div>
                      )}
                      {session.content.filter((item) => item.type === "quiz").length > 0 && (
                        <div className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full">
                          {session.content.filter((item) => item.type === "quiz").length} Quiz(zes)
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" asChild>
                      <Link href={`/sessions/${session.id}/edit`}>Edit</Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="text-red-500 hover:text-red-500 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the session "{session.title}" and all its data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteSession(session.id)}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deletingSessionId === session.id}
                          >
                            {deletingSessionId === session.id ? (
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
                  </div>
                  <Button asChild>
                    <Link href={`/sessions/${session.id}`}>Present</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
