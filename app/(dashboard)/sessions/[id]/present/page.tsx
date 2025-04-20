"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, Copy, Eye, EyeOff } from "lucide-react"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { CopyLinkButton } from "@/components/copy-link-button"
import { QRCodeButton } from "@/components/qr-code-button"

export default function PresentSessionPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [sessionData, setSessionData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [responses, setResponses] = useState<any[]>([])
  const [showResponses, setShowResponses] = useState(false)

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

        // Check if the session belongs to the current user
        if (data.user_id !== session.user.id) {
          setError("You don't have access to this session")
          return
        }

        setSessionData(data)

        // Fetch responses
        fetchResponses(data.id)
      } catch (error) {
        console.error("Error fetching session:", error)
        setError("Failed to load session")
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchSession()
    }
  }, [session, params.id])

  const fetchResponses = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.from("responses").select("*").eq("session_id", sessionId)

      if (error) throw error

      setResponses(data || [])
    } catch (error) {
      console.error("Error fetching responses:", error)
    }
  }

  const getResponsesForCurrentSlide = () => {
    if (!sessionData?.content || sessionData.content.length === 0) return []

    const currentSlide = sessionData.content[currentSlideIndex]
    return responses.filter((r) => r.poll_id === currentSlide.id)
  }

  const handleNextSlide = () => {
    if (currentSlideIndex < (sessionData?.content?.length || 0) - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1)
    }
  }

  const handlePreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1)
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

  const currentSlide = sessionData?.content?.[currentSlideIndex]
  const currentResponses = getResponsesForCurrentSlide()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push(`/sessions/${params.id}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="font-bold">Presenting: {sessionData.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={sessionData.status === "active" ? "default" : "outline"}
              size="sm"
              onClick={toggleSessionStatus}
            >
              {sessionData.status === "active" ? "Active" : "Activate Session"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowResponses(!showResponses)}>
              {showResponses ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showResponses ? "Hide Responses" : "Show Responses"}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Current Slide</CardTitle>
              <CardDescription>
                {currentSlideIndex + 1} of {sessionData?.content?.length || 0}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessionData?.content?.length > 0 ? (
                <div className="p-6 bg-gray-50 rounded-lg min-h-[300px]">
                  <div className="mb-4">
                    <span className="text-sm text-muted-foreground capitalize">
                      {currentSlide.type.replace(/-/g, " ")}
                    </span>
                    <h2 className="text-2xl font-bold">
                      {currentSlide.type === "qa" ? currentSlide.data.title : currentSlide.data.question}
                    </h2>
                    {currentSlide.type === "qa" && currentSlide.data.description && (
                      <p className="text-muted-foreground mt-2">{currentSlide.data.description}</p>
                    )}
                  </div>

                  {showResponses && (
                    <div className="mt-6 border-t pt-4">
                      <h3 className="font-medium mb-2">Responses ({currentResponses.length})</h3>
                      {currentResponses.length === 0 ? (
                        <p className="text-muted-foreground">No responses yet</p>
                      ) : (
                        <div className="max-h-[200px] overflow-y-auto">
                          {/* This is a simplified view - in a real app, you'd render responses based on poll type */}
                          {currentResponses.map((response, index) => (
                            <div key={index} className="p-2 border-b last:border-0">
                              <div className="flex justify-between">
                                <span className="font-medium">{response.participant_name || "Anonymous"}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(response.created_at).toLocaleTimeString()}
                                </span>
                              </div>
                              <div className="text-sm">
                                {typeof response.response === "string"
                                  ? response.response
                                  : JSON.stringify(response.response)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-gray-50 rounded-lg min-h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">No content in this session. Add content in the editor.</p>
                </div>
              )}
            </CardContent>
            <div className="px-6 pb-6 flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousSlide}
                disabled={currentSlideIndex === 0 || sessionData?.content?.length === 0}
              >
                Previous
              </Button>
              <Button
                onClick={handleNextSlide}
                disabled={
                  currentSlideIndex === (sessionData?.content?.length || 0) - 1 || sessionData?.content?.length === 0
                }
              >
                Next
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Join Information</CardTitle>
              <CardDescription>Share with your audience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <CopyLinkButton url={joinUrl} />
                <QRCodeButton url={joinUrl} title={sessionData.title} />
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Session Code</h3>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold tracking-wider">{params.id.substring(0, 6).toUpperCase()}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(params.id.substring(0, 6).toUpperCase())
                      toast.success("Code copied to clipboard")
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Participants can join at {baseUrl}/join</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Responses</h3>
                <p className="text-sm">Total: {responses.length}</p>
                <p className="text-sm">Current slide: {currentResponses.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
