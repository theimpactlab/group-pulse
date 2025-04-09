"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, ArrowLeft, Edit, Play, BarChart, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { CopyLinkButton } from "@/components/copy-link-button"
import { QRCodeButton } from "@/components/qr-code-button"
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

export default function SessionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [sessionData, setSessionData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      fetchSession()
    }
  }, [status, router])

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

  const handleDeleteSession = async () => {
    setIsDeleting(true)
    try {
      const { error } = await supabase.from("sessions").delete().eq("id", params.id)

      if (error) throw error

      toast.success("Session deleted successfully")
      router.push("/sessions")
    } catch (error) {
      console.error("Error deleting session:", error)
      toast.error("Failed to delete session")
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleSessionStatus = async () => {
    try {
      const newStatus = sessionData.status === "active" ? "draft" : "active"

      const { error } = await supabase.from("sessions").update({ status: newStatus }).eq("id", params.id)

      if (error) throw error

      setSessionData({ ...sessionData, status: newStatus })
      toast.success(`Session ${newStatus === "active" ? "activated" : "deactivated"}`)
    } catch (error) {
      console.error("Error updating session status:", error)
      toast.error("Failed to update session status")
    }
  }

  // Generate join URL
  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  const joinUrl = `${baseUrl}/join/${params.id}`

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
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">{error}</div>
          <Button onClick={() => router.push("/sessions")}>Back to Sessions</Button>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.push("/sessions")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{sessionData.title}</h1>
          <div
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              sessionData.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
            }`}
          >
            {sessionData.status === "active" ? "Active" : "Draft"}
          </div>
        </div>

        {sessionData.description && <p className="text-muted-foreground mb-6">{sessionData.description}</p>}

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
              <CardDescription>Basic information about your session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSessionStatus}
                  className={sessionData.status === "active" ? "text-green-600" : ""}
                >
                  {sessionData.status === "active" ? "Active" : "Draft"}
                </Button>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{new Date(sessionData.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Content Items</span>
                <span>{sessionData.content?.length || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Share</CardTitle>
              <CardDescription>Share your session with participants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <CopyLinkButton url={joinUrl} />
                <QRCodeButton url={joinUrl} title={sessionData.title} />
              </div>
              <div className="text-xs text-muted-foreground mt-2">Participants can join using the link or QR code</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Manage your session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" asChild>
                <a href={`/sessions/${params.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" /> Edit Session
                </a>
              </Button>
              <Button className="w-full justify-start" asChild>
                <a href={`/sessions/${params.id}/present`}>
                  <Play className="mr-2 h-4 w-4" /> Present
                </a>
              </Button>
              <Button className="w-full justify-start" asChild>
                <a href={`/sessions/${params.id}/results`}>
                  <BarChart className="mr-2 h-4 w-4" /> View Results
                </a>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full justify-start">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Session
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your session and all associated data.
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
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
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
        </div>

        <Tabs defaultValue="content">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="content" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Content</CardTitle>
                <CardDescription>Interactive elements in your session</CardDescription>
              </CardHeader>
              <CardContent>
                {sessionData.content && sessionData.content.length > 0 ? (
                  <div className="space-y-4">
                    {sessionData.content.map((item: any, index: number) => (
                      <div key={item.id} className="p-4 border rounded-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-sm text-muted-foreground">Question {index + 1}</span>
                            <h3 className="font-medium">
                              {item.type === "multiple-choice" && item.data.question}
                              {item.type === "word-cloud" && item.data.question}
                              {item.type === "open-ended" && item.data.question}
                              {item.type === "scale" && item.data.question}
                              {item.type === "ranking" && item.data.question}
                              {item.type === "qa" && item.data.title}
                              {item.type === "quiz" && item.data.question}
                              {item.type === "image-choice" && item.data.question}
                            </h3>
                          </div>
                          <div className="text-sm text-muted-foreground capitalize">{item.type.replace(/-/g, " ")}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No content yet</p>
                    <Button className="mt-4" asChild>
                      <a href={`/sessions/${params.id}/edit`}>Add Content</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Settings</CardTitle>
                <CardDescription>Configure your session settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Session settings will be available soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
