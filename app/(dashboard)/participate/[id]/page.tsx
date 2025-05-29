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

interface Session {
  id: string
  title: string
  description?: string
  status: "draft" | "active" | "complete"
  code: string
  content: any[]
  current_poll_index?: number
}

export default function ParticipatePage({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [response, setResponse] = useState<any>({})
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
      const { error } = await supabase.from("responses").insert({
        session_id: session.id,
        poll_id: currentPoll.id,
        data: responseData,
        created_at: new Date().toISOString(),
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

  const getCurrentPoll = () => {
    if (!session?.content || !Array.isArray(session.content) || session.content.length === 0) {
      return null
    }

    // If there's a current_poll_index, use that, otherwise use the first poll
    const pollIndex = session.current_poll_index ?? 0
    return session.content[pollIndex] || session.content[0]
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

    const pollData = currentPoll.data

    switch (currentPoll.type) {
      case "multiple-choice":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{pollData.question}</h3>
            {pollData.allowMultipleAnswers ? (
              <div className="space-y-2">
                {pollData.options?.map((option: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`option-${index}`}
                      checked={response.choices?.includes(option.text) || false}
                      onCheckedChange={(checked) => {
                        const currentChoices = response.choices || []
                        if (checked) {
                          setResponse({ choices: [...currentChoices, option.text] })
                        } else {
                          setResponse({ choices: currentChoices.filter((choice: string) => choice !== option.text) })
                        }
                      }}
                    />
                    <Label htmlFor={`option-${index}`}>{option.text}</Label>
                  </div>
                ))}
              </div>
            ) : (
              <RadioGroup value={response.choice || ""} onValueChange={(value) => setResponse({ choice: value })}>
                {pollData.options?.map((option: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.text} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`}>{option.text}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
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
            <h3 className="text-lg font-medium">{pollData.question}</h3>
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
            <h3 className="text-lg font-medium">{pollData.question}</h3>
            <div>
              <Label htmlFor="text-input">Your response</Label>
              <Textarea
                id="text-input"
                value={response.text || ""}
                onChange={(e) => setResponse({ text: e.target.value })}
                placeholder="Type your response..."
                rows={4}
                maxLength={pollData.maxResponseLength}
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

      case "ranking":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{pollData.question}</h3>
            <p className="text-sm text-muted-foreground">Drag to reorder the options from most to least preferred</p>
            <div className="space-y-2">
              {pollData.options?.map((option: any, index: number) => (
                <div key={index} className="p-3 border rounded-md bg-background">
                  <span className="font-medium">{index + 1}.</span> {option.text}
                </div>
              ))}
            </div>
            <Button
              onClick={() => handleSubmitResponse({ ranking: pollData.options?.map((o: any) => o.text) })}
              disabled={submitting}
              className="w-full"
            >
              {submitting ? "Submitting..." : "Submit Ranking"}
            </Button>
          </div>
        )

      case "points-allocation":
        return <PointsAllocationParticipant poll={currentPoll} onSubmit={handleSubmitResponse} disabled={submitting} />

      case "qa":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{pollData.title}</h3>
            {pollData.description && <p className="text-muted-foreground">{pollData.description}</p>}
            <div>
              <Label htmlFor="question-input">Ask a question</Label>
              <Textarea
                id="question-input"
                value={response.question || ""}
                onChange={(e) => setResponse({ question: e.target.value })}
                placeholder="Type your question..."
                rows={3}
              />
            </div>
            <Button
              onClick={() => handleSubmitResponse(response)}
              disabled={!response.question?.trim() || submitting}
              className="w-full"
            >
              {submitting ? "Submitting..." : "Submit Question"}
            </Button>
          </div>
        )

      case "quiz":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{pollData.question}</h3>
            <RadioGroup value={response.choice || ""} onValueChange={(value) => setResponse({ choice: value })}>
              {pollData.options?.map((option: any, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.text} id={`quiz-option-${index}`} />
                  <Label htmlFor={`quiz-option-${index}`}>{option.text}</Label>
                </div>
              ))}
            </RadioGroup>
            <Button
              onClick={() => handleSubmitResponse(response)}
              disabled={!response.choice || submitting}
              className="w-full"
            >
              {submitting ? "Submitting..." : "Submit Answer"}
            </Button>
          </div>
        )

      case "image-choice":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{pollData.question}</h3>
            <div className="grid grid-cols-2 gap-4">
              {pollData.options?.map((option: any, index: number) => (
                <div
                  key={index}
                  className={`cursor-pointer border-2 rounded-lg p-2 transition-colors ${
                    response.choice === option.caption
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setResponse({ choice: option.caption })}
                >
                  <img
                    src={option.imageUrl || "/placeholder.svg"}
                    alt={option.caption || `Option ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                  {option.caption && <p className="text-center mt-2 text-sm">{option.caption}</p>}
                </div>
              ))}
            </div>
            <Button
              onClick={() => handleSubmitResponse(response)}
              disabled={!response.choice || submitting}
              className="w-full"
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        )

      default:
        return (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">Unknown poll type: {currentPoll.type}</h3>
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
