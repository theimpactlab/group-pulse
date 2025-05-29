"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase"
import { PointsAllocationParticipant } from "@/components/poll-participants/points-allocation-participant"

interface Poll {
  id: string
  title: string
  description?: string
  type: string
  data: any
  session_id: string
}

interface Session {
  id: string
  title: string
  status: "draft" | "active" | "complete"
  code: string
}

export default function ParticipatePage({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<Session | null>(null)
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [response, setResponse] = useState<any>({})
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchSessionAndPoll()
  }, [params.id])

  const fetchSessionAndPoll = async () => {
    try {
      // First get the session
      const { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", params.id)
        .single()

      if (sessionError) throw sessionError

      setSession(sessionData)

      // Then get the current active poll for this session
      const { data: pollData, error: pollError } = await supabase
        .from("polls")
        .select("*")
        .eq("session_id", params.id)
        .eq("is_active", true)
        .single()

      if (pollError && pollError.code !== "PGRST116") {
        throw pollError
      }

      setCurrentPoll(pollData)
    } catch (error) {
      console.error("Error fetching session/poll:", error)
      toast({
        title: "Error",
        description: "Failed to load the session. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitResponse = async (responseData: any) => {
    if (!currentPoll) return

    setSubmitting(true)
    try {
      const { error } = await supabase.from("responses").insert({
        poll_id: currentPoll.id,
        session_id: params.id,
        data: responseData,
      })

      if (error) throw error

      toast({
        title: "Response submitted",
        description: "Thank you for your participation!",
      })

      // Redirect to thank you page
      router.push(`/participate/${params.id}/thank-you`)
    } catch (error) {
      console.error("Error submitting response:", error)
      toast({
        title: "Error",
        description: "Failed to submit your response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const renderPollContent = () => {
    if (!currentPoll) {
      return (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium mb-2">No active poll</h3>
          <p className="text-muted-foreground">There is currently no active poll for this session.</p>
        </div>
      )
    }

    const pollData = currentPoll.data

    switch (currentPoll.type) {
      case "multiple-choice":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{pollData.question}</h3>
            <RadioGroup value={response.choice || ""} onValueChange={(value) => setResponse({ choice: value })}>
              {pollData.options?.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
            <Button
              onClick={() => handleSubmitResponse(response)}
              disabled={!response.choice || submitting}
              className="w-full"
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        )

      case "word-cloud":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{pollData.question}</h3>
            <div>
              <Label htmlFor="word-input">Enter a word or phrase</Label>
              <Input
                id="word-input"
                value={response.word || ""}
                onChange={(e) => setResponse({ word: e.target.value })}
                placeholder="Type your response..."
                maxLength={50}
              />
            </div>
            <Button
              onClick={() => handleSubmitResponse(response)}
              disabled={!response.word?.trim() || submitting}
              className="w-full"
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        )

      case "open-ended":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{pollData.question}</h3>
            <div>
              <Label htmlFor="text-input">Your response</Label>
              <Textarea
                id="text-input"
                value={response.text || ""}
                onChange={(e) => setResponse({ text: e.target.value })}
                placeholder="Type your response..."
                rows={4}
              />
            </div>
            <Button
              onClick={() => handleSubmitResponse(response)}
              disabled={!response.text?.trim() || submitting}
              className="w-full"
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        )

      case "scale":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{pollData.question}</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{pollData.minLabel || "Min"}</span>
                <span>{pollData.maxLabel || "Max"}</span>
              </div>
              <Slider
                value={[response.value || pollData.min || 1]}
                onValueChange={(value) => setResponse({ value: value[0] })}
                min={pollData.min || 1}
                max={pollData.max || 10}
                step={1}
                className="w-full"
              />
              <div className="text-center">
                <span className="text-lg font-medium">{response.value || pollData.min || 1}</span>
              </div>
            </div>
            <Button onClick={() => handleSubmitResponse(response)} disabled={submitting} className="w-full">
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        )

      case "points-allocation":
        return <PointsAllocationParticipant poll={currentPoll} onSubmit={handleSubmitResponse} disabled={submitting} />

      default:
        return (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">Unknown poll type</h3>
            <p className="text-muted-foreground">This poll type is not supported yet.</p>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Session not found</CardTitle>
            <CardDescription>The session you're looking for doesn't exist or has been removed.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (session.status === "complete") {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Session Complete</CardTitle>
            <CardDescription>This session has ended. Thank you for your participation!</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (session.status !== "active") {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Session Not Active</CardTitle>
            <CardDescription>
              This session is not currently active. Please wait for the presenter to start the session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>Refresh</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{session.title}</CardTitle>
          <CardDescription>
            Session Code: <span className="font-mono font-bold">{session.code}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>{renderPollContent()}</CardContent>
      </Card>
    </div>
  )
}
