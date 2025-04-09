"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, BarChart3, Users, Calendar, Plus } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalParticipants: 0,
    recentActivity: null,
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/login"
    } else if (status === "authenticated" && session?.user?.id) {
      fetchStats()
    } else if (status !== "loading") {
      setIsLoading(false)
    }
  }, [status, session])

  const fetchStats = async () => {
    try {
      // Fetch sessions count
      const { data: sessions, error: sessionsError } = await supabase
        .from("sessions")
        .select("id, created_at")
        .eq("user_id", session?.user?.id)
        .order("created_at", { ascending: false })

      if (sessionsError) throw sessionsError

      // Fetch responses count (as a proxy for participants)
      const { count: responsesCount, error: responsesError } = await supabase
        .from("responses")
        .select("id", { count: "exact" })
        .in("session_id", sessions?.map((s) => s.id) || [])

      if (responsesError) throw responsesError

      setStats({
        totalSessions: sessions?.length || 0,
        totalParticipants: responsesCount || 0,
        recentActivity: sessions && sessions.length > 0 ? new Date(sessions[0].created_at) : null,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setIsLoading(false)
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

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Link href="/create-session">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Create Session
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalSessions === 0
                  ? "No sessions created yet"
                  : `${stats.totalSessions} session${stats.totalSessions !== 1 ? "s" : ""} created`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalParticipants}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalParticipants === 0
                  ? "No participants yet"
                  : `${stats.totalParticipants} response${stats.totalParticipants !== 1 ? "s" : ""} received`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.recentActivity
                  ? new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(stats.recentActivity)
                  : "-"}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.recentActivity ? "Last session created" : "No recent activity"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Follow these steps to create your first interactive session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4 p-4 border rounded-md">
                <div className="bg-primary/10 text-primary rounded-full p-2">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-medium">Create a new session</h3>
                  <p className="text-sm text-muted-foreground">
                    Start by creating a new interactive session for your audience
                  </p>
                  <Button className="mt-2" size="sm" asChild>
                    <Link href="/create-session">Create Session</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
