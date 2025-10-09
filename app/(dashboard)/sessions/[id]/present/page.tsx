"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import { CopyLinkButton } from "@/components/copy-link-button"
import { QRCodeButton } from "@/components/qr-code-button"
import { isSessionPresentable } from "@/lib/session-status"

export default function PresentSessionPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [sessionData, setSessionData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

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

      // Check if the session is presentable
      if (!isSessionPresentable(data.status)) {
        setError("This session is marked as complete and cannot be presented")
        return
      }

      setSessionData(data)
      setCurrentSlideIndex(data.current_poll_index ?? 0)
    } catch (error) {
      console.error("Error fetching session:", error)
      setError("Failed to load session")
    } finally {
      setIsLoading(false)
    }
  }

  const updateCurrentPollIndex = async (newIndex: number) => {
    try {
      const { error } = await supabase.from("sessions").update({ current_poll_index: newIndex }).eq("id", params.id)

      if (error) {
        console.error("Error updating current poll index:", error)
      }
    } catch (error) {
      console.error("Error updating current poll index:", error)
    }
  }

  const goToNextSlide = async () => {
    if (sessionData?.content && currentSlideIndex < sessionData.content.length - 1) {
      const newIndex = currentSlideIndex + 1
      setCurrentSlideIndex(newIndex)
      await updateCurrentPollIndex(newIndex)
    }
  }

  const goToPreviousSlide = async () => {
    if (currentSlideIndex > 0) {
      const newIndex = currentSlideIndex - 1
      setCurrentSlideIndex(newIndex)
      await updateCurrentPollIndex(newIndex)
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
          <Button onClick={() => router.push(`/sessions/${params.id}`)}>Back to Session</Button>
        </main>
      </div>
    )
  }

  const currentSlide = sessionData?.content?.[currentSlideIndex]
  const totalSlides = sessionData?.content?.length || 0

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between p-4 border-b">
        <Button variant="outline" size="icon" onClick={() => router.push(`/sessions/${params.id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {sessionData.title} - Slide {currentSlideIndex + 1} of {totalSlides}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CopyLinkButton url={joinUrl} />
          <QRCodeButton url={joinUrl} title={sessionData.title} />
        </div>
      </header>

      <main className="flex-1 container py-6 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          {totalSlides > 0 ? (
            <Card className="w-full max-w-4xl">
              <CardContent className="p-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">
                    {currentSlide?.type === "multiple-choice" && currentSlide?.data?.question}
                    {currentSlide?.type === "word-cloud" && currentSlide?.data?.question}
                    {currentSlide?.type === "open-ended" && currentSlide?.data?.question}
                    {currentSlide?.type === "scale" && currentSlide?.data?.question}
                    {currentSlide?.type === "ranking" && currentSlide?.data?.question}
                    {currentSlide?.type === "qa" && currentSlide?.data?.title}
                    {currentSlide?.type === "quiz" && currentSlide?.data?.question}
                    {currentSlide?.type === "image-choice" && currentSlide?.data?.question}
                  </h2>
                  <div className="text-sm text-muted-foreground mb-6">
                    {currentSlide?.type && <span className="capitalize">{currentSlide.type.replace(/-/g, " ")}</span>}
                  </div>

                  {/* Placeholder for slide content */}
                  <div className="h-64 flex items-center justify-center border rounded-md bg-muted/20">
                    <p className="text-muted-foreground">
                      {sessionData.code ? (
                        <>
                          Join with code: <span className="font-mono font-bold">{sessionData.code}</span>
                        </>
                      ) : (
                        <>Scan QR code or use link to participate</>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center">
              <p className="text-muted-foreground">This session has no content yet.</p>
              <Button className="mt-4" onClick={() => router.push(`/sessions/${params.id}/edit`)}>
                Add Content
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" onClick={goToPreviousSlide} disabled={currentSlideIndex === 0}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button onClick={goToNextSlide} disabled={currentSlideIndex === totalSlides - 1}>
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  )
}
