"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, BarChart3, Calendar, Plus, MessageSquare, CloudRain, Scale, ListOrdered, HelpCircle, BrainCircuit, ImageIcon, SlidersHorizontal, CircleDollarSign } from 'lucide-react'
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSessions: 0,
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
        .limit(5)

      if (sessionsError) throw sessionsError

      setStats({
        totalSessions: sessions?.length || 0,
        recentActivity: sessions && sessions.length > 0 ? new Date(sessions[0].created_at) : null,
        recentSessions: sessions || [],
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const pollTypes = [
    {
      id: "multiple-choice",
      name: "Multiple Choice",
      description: "Let your audience choose from options you define. Great for gauging opinions or testing knowledge.",
      icon: BarChart3,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      id: "word-cloud",
      name: "Word Cloud",
      description: "Collect words or short phrases that form a visually appealing cloud based on frequency.",
      icon: CloudRain,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      id: "open-ended",
      name: "Open-ended Questions",
      description: "Gather detailed text responses for qualitative feedback and insights.",
      icon: MessageSquare,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      id: "scale",
      name: "Scale",
      description: "Ask participants to rate something on a numeric scale, perfect for satisfaction surveys.",
      icon: Scale,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      id: "slider",
      name: "Slider",
      description: "Position responses on a spectrum between two options, ideal for measuring sentiment.",
      icon: SlidersHorizontal,
      color: "text-teal-500",
      bgColor: "bg-teal-50",
    },
    {
      id: "ranking",
      name: "Ranking",
      description: "Have participants rank items in order of preference or importance.",
      icon: ListOrdered,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      id: "qa",
      name: "Q&A Session",
      description: "Allow participants to ask questions and upvote others' questions.",
      icon: HelpCircle,
      color: "text-cyan-500",
      bgColor: "bg-cyan-50",
    },
    {
      id: "quiz",
      name: "Quiz",
      description: "Test knowledge with questions that have correct answers and scoring.",
      icon: BrainCircuit,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
    },
    {
      id: "image-choice",
      name: "Image Choice",
      description: "Let participants choose between different images or visual options.",
      icon: ImageIcon,
      color: "text-pink-500",
      bgColor: "bg-pink-50",
    },
    {
      id: "points-allocation",
      name: "100 Points",
      description: "Let participants distribute a fixed number of points among different options.",
      icon: CircleDollarSign,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
  ]

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

        <div className="grid gap-6 md:grid-cols-3 mb-6">
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
                    }).format(new Date(stats.recentActivity))
                  : "-"}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.recentActivity ? "Last session created" : "No recent activity"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Quick Start</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link href="/create-session">Create New Session</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="recent" className="mt-6">
          <TabsList>
            <TabsTrigger value="recent">Recent Sessions</TabsTrigger>
            <TabsTrigger value="poll-types">Poll Types</TabsTrigger>
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          </TabsList>

          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
                <CardDescription>Your most recently created sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.recentSessions.length > 0 ? (
                  <div className="space-y-4
