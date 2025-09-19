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
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { PointsAllocationParticipant } from "@/components/poll-participants/points-allocation-participant"
import { SimpleTestComponent } from "@/components/poll-participants/simple-test-component"
import { WhiteboardParticipant } from "@/components/poll-participants/whiteboard-participant"

export default function ParticipatePage({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [response, setResponse] = useState<any>({})
  const [useTestComponent, setUseTestComponent] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchSession()
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

  const handleSubmitResponse = async (responseData: any) => {
    if (!session || !getCurrentPoll()) return

    setSubmitting(true)
    try {
      const currentPoll = getCurrentPoll()

      // Prepare the response data
      const submissionData = {
        session_id: session.id,
        poll_id: currentPoll.id || `poll_${Date.now()}`,
        response: responseData, // Changed from 'data' to 'response'
        participant_name: null, // Optional participant name
        participant_id: `participant_${Date.now()}`, // Generate a participant ID
        element_id: currentPoll.id || `poll_${Date.now()}`, // Use poll ID as element ID
        created_at: new Date().toISOString(),
      }

      console.log("Submitting response data:", submissionData)

      const { data, error } = await supabase.from("responses").insert(submissionData).select()

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      console.log("Response submitted successfully:", data)

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

  const getCurrentPoll = () => {
    if (!session?.content || !Array.isArray(session.content) || session.content.length === 0) {
      return null
    }

    // If there's a current_poll_index, use that, otherwise use the first poll
    const pollIndex = session.current_poll_index ?? 0
    return session.content[pollIndex] || session.content[0]
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
                  id={`option-${index}`}
                  checked={response.choices?.includes(optionId) || false}
                  onCheckedChange={(checked) => {
                    const currentChoices = response.choices || []
                    if (checked) {
                      setResponse({ choices: [...currentChoices, optionId] })
                    } else {
                      setResponse({ choices: currentChoices.filter((choice: string) => choice !== optionId) })
                    }
                  }}
                />
                <Label htmlFor={`option-${index}`}>{optionText}</Label>
              </div>
            )
          })}
        </div>
      )
    }

    return (
      <RadioGroup value={response.choice || ""} onValueChange={(value) => setResponse({ choice: value })}>
        {options.map((option: any, index: number) => {
          const optionText = typeof option === "string" ? option : option.text || option.id || `Option ${index + 1}`
          const optionId = typeof option === "string" ? option : option.id || option.text || `option-${index}`

          return (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={optionId} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`}>{optionText}</Label>
            </div>
          )
        })}
      </RadioGroup>
    )
  }

  const renderPollContent = () => {
    const currentPoll = getCurrentPoll()

    if (!currentPoll) {
      return (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium mb-2">No active poll</h3>
          <p className="text-muted-foreground">There is currently no active poll for this session.</p>
        </div>
      )
    }

    const pollData = currentPoll.data || {}

    switch (currentPoll.type) {
      case "multiple-choice":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{pollData.question || "Multiple Choice Question"}</h3>
            {renderMultipleChoice(currentPoll)}
            <Button
              onClick={() => handleSubmitResponse(response)}
              disabled={(!response.choice && !response.choices?.length) || submitting}
              className="w-full"
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        )

      case "word-cloud":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{pollData.question || "Word Cloud"}</h3>
            <div>
              <Label htmlFor="word-input">Enter a word or phrase</Label>
              <Input
                id="word-input"
                value={response.word || ""}
                onChange={(e) => setResponse({ word: e.target.value })}
                placeholder="Type your response..."
                maxLength={pollData.maxEntries || 50}
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
            <h3 className="text-lg font-medium">{pollData.question || "Open Ended Question"}</h3>
            <div>
              <Label htmlFor="text-input">Your response</Label>
              <Textarea
                id="text-input"
                value={response.text || ""}
                onChange={(e) => setResponse({ text: e.target.value })}
                placeholder="Type your response..."
                rows={4}
                maxLength={pollData.maxResponseLength || 1000}
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
            <h3 className="text-lg font-medium">{pollData.question || "Scale Question"}</h3>
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
                step={pollData.step || 1}
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
              <SimpleTestComponent onSubmit={handleSubmitResponse} />
            ) : (
              <PointsAllocationParticipant poll={currentPoll} onSubmit={handleSubmitResponse} disabled={submitting} />
            )}
          </div>
        )

      case "whiteboard":
        return (
          <WhiteboardParticipant
            poll={currentPoll}
            sessionId={session.id}
            participantId={`participant_${Date.now()}`}
            participantName="Anonymous"
            onResponse={handleSubmitResponse}
          />
        )

      default:
        return (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">Poll Type: {currentPoll.type}</h3>
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

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{session.title || "Interactive Session"}</CardTitle>
          <CardDescription>
            Session Code: <span className="font-mono font-bold">{session.code || params.id}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>{renderPollContent()}</CardContent>
      </Card>
    </div>
  )
}
