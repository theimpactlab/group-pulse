"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, BarChart3, Users, Calendar, Plus, PieChart, ArrowRight } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    totalResponses: 0,
    uniqueParticipants: 0,
    recentActivity: null,
    recentSessions: [],
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.id) {
      fetchStats()
    } else if (status !== "loading") {
      setIsLoading(false)
    }
  }, [status, session, router])

  const fetchStats = async () => {
    try {
      // Fetch sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from("sessions")
        .select("id, title, status, created_at, content")
        .eq("user_id", session?.user?.id)
        .order("created_at", { ascending: false })

      if (sessionsError) throw sessionsError

      // Count active sessions
      const activeSessions = sessions?.filter((s) => s.status === "active").length || 0

      // Fetch responses
      const sessionIds = sessions?.map((s) => s.id) || []
      let responsesData = []
      let participantCount = 0

      if (sessionIds.length > 0) {
        const { data: responses, error: responsesError } = await supabase
          .from("responses")
          .select("id, session_id, participant_name, created_at")
          .in("session_id", sessionIds)
          .order("created_at", { ascending: false })

        if (responsesError) throw responsesError

        responsesData = responses || []

        // Count unique participants
        const uniqueParticipants = new Set()
        responsesData.forEach((r) => {
          if (r.participant_name) uniqueParticipants.add(r.participant_name)
        })
        participantCount = uniqueParticipants.size
      }

      // Get recent sessions (limit to 5)
      const recentSessions = sessions?.slice(0, 5) || []

      setStats({
        totalSessions: sessions?.length || 0,
        activeSessions,
        totalResponses: responsesData.length,
        uniqueParticipants: participantCount,
        recentActivity: sessions && sessions.length > 0 ? new Date(sessions[0].created_at) : null,
        recentSessions,
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

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalSessions === 0 ? "No sessions created yet" : `${stats.activeSessions} active`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalResponses}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalResponses === 0 ? "No responses yet" : `Across all sessions`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueParticipants}</div>
              <p className="text-xs text-muted-foreground">
                {stats.uniqueParticipants === 0 ? "No participants yet" : `Unique participants`}
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
                    }).format(new Date(stats.recentActivity))
                  : "-"}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.recentActivity ? "Last session created" : "No recent activity"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="recent" className="mt-6">
          <TabsList>
            <TabsTrigger value="recent">Recent Sessions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
                <CardDescription>Your most recently created sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.recentSessions.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentSessions.map((session: any) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded-md">
                        <div>
                          <h3 className="font-medium">{session.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                session.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {session.status}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(session.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/sessions/${session.id}`}>
                            View <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No sessions created yet</p>
                    <Button className="mt-4" asChild>
                      <Link href="/create-session">Create Your First Session</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
              {stats.totalSessions > 5 && (
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/sessions">View All Sessions</Link>
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>Summary of your interactive sessions and participant engagement</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.totalSessions > 0 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium mb-2">Session Engagement</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Average responses per session:{" "}
                          {stats.totalSessions > 0 ? Math.round(stats.totalResponses / stats.totalSessions) : 0}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${
                                stats.totalSessions > 0
                                  ? Math.min(100, (stats.totalResponses / stats.totalSessions) * 10)
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium mb-2">Active Sessions</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {stats.activeSessions} of {stats.totalSessions} sessions active
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${
                                stats.totalSessions > 0 ? (stats.activeSessions / stats.totalSessions) * 100 : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <Button asChild>
                        <Link href="/sessions">View Detailed Analytics</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Create sessions to view analytics</p>
                    <Button className="mt-4" asChild>
                      <Link href="/create-session">Create Your First Session</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
