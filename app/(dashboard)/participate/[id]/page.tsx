"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { PointsAllocationParticipant } from "@/components/poll-participants/points-allocation-participant"
import { SimpleTestComponent } from "@/components/poll-participants/simple-test-component"
import { WhiteboardParticipant } from "@/components/poll-participants/whiteboard-participant"
import { SliderParticipant } from "@/components/poll-participants/slider-participant"

export default function ParticipatePage() {
    const params = useParams()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [useTestComponent, setUseTestComponent] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchSession()

    const channel = supabase
      .channel(`session-${params.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sessions",
          filter: `id=eq.${params.id}`,
        },
        (payload) => {
          console.log("[v0] Session updated:", payload)
          setSession(payload.new)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [params.id])

  const fetchSession = async () => {
    try {
      // Get the session by ID or code
      let { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", params.id)
        .single()

      // If not found by ID, try by code
      if (sessionError && sessionError.code === "PGRST116") {
        const { data: codeData, error: codeError } = await supabase
          .from("sessions")
          .select("*")
          .eq("code", params.id.toUpperCase())
          .single()

        if (codeError) throw codeError
        sessionData = codeData
      } else if (sessionError) {
        throw sessionError
      }

      console.log("Session data:", sessionData)
      setSession(sessionData)
    } catch (error) {
      console.error("Error fetching session:", error)
      toast({
        title: "Error",
        description: "Failed to load the session. Please check the session code and try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAllResponses = async () => {
    if (!session) return

    // Check if at least one response is provided
    const hasResponses = Object.keys(responses).length > 0
    if (!hasResponses) {
      toast({
        title: "No responses",
        description: "Please answer at least one question before submitting.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const responseData = Object.entries(responses).map(([pollId, data]) => ({
        session_id: session.id,
        poll_id: pollId,
        response: data,
        participant_id: `participant_${Date.now()}`,
      }))

      // Submit all responses
      const { data, error } = await supabase.from("responses").insert(responseData).select()

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      console.log("All responses submitted successfully:", data)

      toast({
        title: "Responses submitted",
        description: "Thank you for your participation!",
      })

      // Redirect to thank you page
      router.push(`/participate/${params.id}/thank-you`)
    } catch (error) {
      console.error("Error submitting responses:", error)
      toast({
        title: "Error",
        description: "Failed to submit your responses. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const updateResponse = (pollId: string, data: any) => {
    setResponses((prev) => ({
      ...prev,
      [pollId]: data,
    }))
  }

  const renderMultipleChoice = (poll: any) => {
    const pollData = poll.data || {}
    const options = pollData.options || []

    if (pollData.allowMultipleAnswers) {
      return (
        <div className="space-y-2">
          {options.map((option: any, index: number) => {
            const optionText = typeof option === "string" ? option : option.text || option.id || `Option ${index + 1}`
            const optionId = typeof option === "string" ? option : option.id || option.text || `option-${index}`

            return (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`option-${poll.id}-${index}`}
                  checked={responses[poll.id]?.choices?.includes(optionId) || false}
                  onCheckedChange={(checked) => {
                    const currentChoices = responses[poll.id]?.choices || []
                    if (checked) {
                      updateResponse(poll.id, { choices: [...currentChoices, optionId] })
                    } else {
                      updateResponse(poll.id, {
                        choices: currentChoices.filter((choice: string) => choice !== optionId),
                      })
                    }
                  }}
                />
                <Label htmlFor={`option-${poll.id}-${index}`}>{optionText}</Label>
              </div>
            )
          })}
        </div>
      )
    }

    return (
      <RadioGroup
        value={responses[poll.id]?.choice || ""}
        onValueChange={(value) => updateResponse(poll.id, { choice: value })}
      >
        {options.map((option: any, index: number) => {
          const optionText = typeof option === "string" ? option : option.text || option.id || `Option ${index + 1}`
          const optionId = typeof option === "string" ? option : option.id || option.text || `option-${index}`

          return (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={optionId} id={`option-${poll.id}-${index}`} />
              <Label htmlFor={`option-${poll.id}-${index}`}>{optionText}</Label>
            </div>
          )
        })}
      </RadioGroup>
    )
  }

  const renderPollContent = () => {
    if (!session?.content || !Array.isArray(session.content) || session.content.length === 0) {
      return (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium mb-2">No polls available</h3>
          <p className="text-muted-foreground">There are currently no polls for this session.</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {session.content.map((poll: any, index: number) => (
          <Card key={poll.id || index}>
            <CardHeader>
              <CardTitle>Question {index + 1}</CardTitle>
              <CardDescription className="capitalize">{poll.type.replace(/-/g, " ")}</CardDescription>
            </CardHeader>
            <CardContent>{renderSinglePoll(poll)}</CardContent>
          </Card>
        ))}

        <div className="sticky bottom-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg border shadow-lg">
          <Button
            onClick={handleSubmitAllResponses}
            disabled={submitting || Object.keys(responses).length === 0}
            className="w-full"
            size="lg"
          >
            {submitting ? "Submitting..." : `Submit All Responses (${Object.keys(responses).length} answered)`}
          </Button>
        </div>
      </div>
    )
  }

  const renderSinglePoll = (poll: any) => {
    const pollData = poll.data || {}

    switch (poll.type) {
      case "multiple-choice":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{pollData.question || "Multiple Choice Question"}</h3>
            {renderMultipleChoice(poll)}
          </div>
        )

      case "word-cloud":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{pollData.question || "Word Cloud"}</h3>
            <div>
              <Label htmlFor={`word-input-${poll.id}`}>Enter a word or phrase</Label>
              <Input
                id={`word-input-${poll.id}`}
                value={responses[poll.id]?.word || ""}
                onChange={(e) => updateResponse(poll.id, { word: e.target.value })}
                placeholder="Type your response..."
                maxLength={pollData.maxEntries || 50}
              />
            </div>
          </div>
        )

      case "open-ended":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{pollData.question || "Open Ended Question"}</h3>
            <div>
              <Label htmlFor={`text-input-${poll.id}`}>Your response</Label>
              <Textarea
                id={`text-input-${poll.id}`}
                value={responses[poll.id]?.text || ""}
                onChange={(e) => updateResponse(poll.id, { text: e.target.value })}
                placeholder="Type your response..."
                rows={4}
                maxLength={pollData.maxResponseLength || 1000}
              />
            </div>
          </div>
        )

      case "scale":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{pollData.question || "Scale Question"}</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{pollData.minLabel || "Min"}</span>
                <span>{pollData.maxLabel || "Max"}</span>
              </div>
              <Slider
                value={[responses[poll.id]?.value || pollData.min || 1]}
                onValueChange={(value) => updateResponse(poll.id, { value: value[0] })}
                min={pollData.min || 1}
                max={pollData.max || 10}
                step={pollData.step || 1}
                className="w-full"
              />
              <div className="text-center">
                <span className="text-lg font-medium">{responses[poll.id]?.value || pollData.min || 1}</span>
              </div>
            </div>
          </div>
        )

      case "slider":
        return (
          <SliderParticipant poll={poll} onSubmit={(data) => updateResponse(poll.id, data)} disabled={submitting} />
        )

      case "points-allocation":
        return (
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button
                variant={useTestComponent ? "outline" : "default"}
                onClick={() => setUseTestComponent(false)}
                size="sm"
              >
                Use Points Component
              </Button>
              <Button
                variant={useTestComponent ? "default" : "outline"}
                onClick={() => setUseTestComponent(true)}
                size="sm"
              >
                Use Test Component
              </Button>
            </div>

            {useTestComponent ? (
              <SimpleTestComponent onSubmit={(data) => updateResponse(poll.id, data)} />
            ) : (
              <PointsAllocationParticipant
                poll={poll}
                onSubmit={(data) => updateResponse(poll.id, data)}
                disabled={submitting}
              />
            )}
          </div>
        )

      case "whiteboard":
        return (
          <WhiteboardParticipant
            poll={poll}
            sessionId={session.id}
            participantId={`participant_${Date.now()}`}
            participantName="Anonymous"
            onResponse={(data) => updateResponse(poll.id, data)}
          />
        )

      default:
        return (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">Poll Type: {poll.type}</h3>
            <p className="text-muted-foreground">This poll type is not yet supported in the participant view.</p>
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
            <Button onClick={() => router.push("/")}>Go to Home</Button>
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
            <Button onClick={() => router.push("/")}>Go to Home</Button>
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

  return <div className="container mx-auto py-10 max-w-5xl">{renderPollContent()}</div>
}
