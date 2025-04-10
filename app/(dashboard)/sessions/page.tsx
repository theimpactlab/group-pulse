"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, Users, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { CopyLinkButton } from "@/components/copy-link-button"

export default function SessionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [sessions, setSessions] = useState<any[]>([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      fetchSessions()
    }
  }, [status, router])

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", session?.user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setSessions(data || [])
    } catch (error) {
      console.error("Error fetching sessions:", error)
      toast.error("Failed to load sessions")
    } finally {
      setIsLoading(false)
    }
  }

  const getJoinUrl = (id: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    return `${baseUrl}/join/${id}`
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

        {sessions.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">No sessions found</h3>
                <p className="text-muted-foreground mb-8">Create your first interactive session to get started.</p>
                <Button asChild>
                  <Link href="/create-session">Create Your First Session</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((sessionItem) => (
              <Card key={sessionItem.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span className="truncate mr-2">{sessionItem.title}</span>
                    <span
                      className={`text-xs font-normal px-2 py-1 rounded-full ${
                        sessionItem.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {sessionItem.status === "active" ? "Active" : "Draft"}
                    </span>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {sessionItem.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    Created {format(new Date(sessionItem.created_at), "PPP")}
                  </div>
                  {sessionItem.content && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      {sessionItem.content.length} item{sessionItem.content.length !== 1 ? "s" : ""}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <CopyLinkButton url={getJoinUrl(sessionItem.id)} />
                  <Button asChild size="sm">
                    <Link href={`/sessions/${sessionItem.id}`}>
                      View <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
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
