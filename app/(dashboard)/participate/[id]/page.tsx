"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import type { PollType } from "@/types/poll-types"
import { supabase } from "@/lib/supabase"
import { useColorScheme } from "@/hooks/use-color-scheme"

export default function ParticipateSessionPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const participantName = searchParams.get("name") || "Anonymous"
  const [isLoading, setIsLoading] = useState(true)
  const [sessionData, setSessionData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [textInputs, setTextInputs] = useState<Record<string, string>>({})
  const [scaleValues, setScaleValues] = useState<Record<string, number>>({})
  const [rankingOrder, setRankingOrder] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedPolls, setSubmittedPolls] = useState<string[]>([])

  const colorScheme = useColorScheme()

  useEffect(() => {
    async function fetchSession() {
      if (!params.id) return

      try {
        setIsLoading(true)

        // Use the public API route instead of direct Supabase access
        const response = await fetch(`/api/public/sessions/${params.id}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to load session")
        }

        const data = await response.json()
        setSessionData(data)
      } catch (err: any) {
        console.error("Error fetching session:", err)
        setError(err.message || "Failed to load session. Please check the session code and try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()
  }, [params.id])

  const handleResponse = (pollId: string, response: any) => {
    setResponses({
      ...responses,
      [pollId]: response,
    })
  }

  const handleTextInput = (pollId: string, value: string) => {
    setTextInputs({
      ...textInputs,
      [pollId]: value,
    })
    // Automatically update the response as the user types
    handleResponse(pollId, value)
  }

  const handleTextSubmit = (pollId: string) => {
    if (textInputs[pollId]?.trim()) {
      handleResponse(pollId, textInputs[pollId])
      // Clear the input after submission
      setTextInputs({
        ...textInputs,
        [pollId]: "",
      })
    }
  }

  const handleScaleChange = (pollId: string, value: number) => {
    setScaleValues({
      ...scaleValues,
      [pollId]: value,
    })
    handleResponse(pollId, value)
  }

  const handleRankingChange = (pollId: string, itemId: string, direction: "up" | "down") => {
    const currentPoll = sessionData.content.find((poll: any) => poll.id === pollId)
    if (!currentPoll) return

    // Initialize ranking order if not already set
    if (!rankingOrder[pollId]) {
      const initialOrder = currentPoll.data.options.map((option: any) => option.id)
      setRankingOrder({
        ...rankingOrder,
        [pollId]: initialOrder,
      })
      return
    }

    const currentOrder = [...rankingOrder[pollId]]
    const currentIndex = currentOrder.indexOf(itemId)

    if (currentIndex === -1) return

    // Move item up or down
    if (direction === "up" && currentIndex > 0) {
      // Swap with the item above
      ;[currentOrder[currentIndex], currentOrder[currentIndex - 1]] = [
        currentOrder[currentIndex - 1],
        currentOrder[currentIndex],
      ]
    } else if (direction === "down" && currentIndex < currentOrder.length - 1) {
      // Swap with the item below
      ;[currentOrder[currentIndex], currentOrder[currentIndex + 1]] = [
        currentOrder[currentIndex + 1],
        currentOrder[currentIndex],
      ]
    }

    setRankingOrder({
      ...rankingOrder,
      [pollId]: currentOrder,
    })

    handleResponse(pollId, currentOrder)
  }

  // Replace the submitResponse function with this simplified version that uses direct Supabase access
  // and ensures proper toast notifications and redirects

  const submitResponse = async (pollId: string) => {
    if (submittedPolls.includes(pollId)) {
      toast.info("You've already submitted a response for this question")
      return
    }

    if (!responses[pollId]) {
      toast.error("Please provide a response before submitting")
      return
    }

    setIsSubmitting(true)

    try {
      // Create the response data object
      const responseData = {
        id: uuidv4(),
        poll_id: pollId,
        session_id: params.id as string,
        participant_name: participantName,
        response: responses[pollId],
        created_at: new Date().toISOString(),
      }

      console.log("Submitting response:", responseData)

      // Use direct Supabase access since there's no RLS
      const { error } = await supabase.from("responses").insert([responseData])

      if (error) {
        console.error("Supabase error:", error)
        throw new Error(error.message || "Failed to submit response")
      }

      // Force a toast notification
      toast.success("Response submitted successfully!")

      // Update submitted polls state
      setSubmittedPolls((prev) => [...prev, pollId])

      // Check if this was the last poll
      const isLastPoll = currentSlideIndex === sessionData.content.length - 1
      const allPollsSubmitted = [...submittedPolls, pollId].length === sessionData.content.length

      if (isLastPoll || allPollsSubmitted) {
        // If this was the last poll or all polls are now submitted, redirect to thank you page
        toast.success("All done! Redirecting to thank you page...")
        setTimeout(() => {
          router.push(`/participate/${params.id}/thank-you?name=${encodeURIComponent(participantName)}`)
        }, 1500)
      } else if (currentSlideIndex < sessionData.content.length - 1) {
        // Otherwise, move to the next slide if available
        toast.success("Moving to next question...")
        setTimeout(() => {
          setCurrentSlideIndex(currentSlideIndex + 1)
        }, 1000)
      }
    } catch (err: any) {
      console.error("Error submitting response:", err)
      toast.error(err.message || "Failed to submit response. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderPollParticipation = (poll: PollType) => {
    const isSubmitted = submittedPolls.includes(poll.id)

    switch (poll.type) {
      case "multiple-choice":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{poll.data.question}</h2>
            <div className="space-y-3">
              {poll.data.options.map((option) => {
                const isSelected = poll.data.allowMultipleAnswers
                  ? (responses[poll.id] || []).includes(option.id)
                  : responses[poll.id] === option.id

                return (
                  <Button
                    key={option.id}
                    variant={isSelected ? "default" : "outline"}
                    className="w-full justify-start h-auto py-3 px-4 text-left"
                    onClick={() => {
                      if (isSubmitted) return

                      if (poll.data.allowMultipleAnswers) {
                        const currentSelections = responses[poll.id] || []
                        const newSelections = currentSelections.includes(option.id)
                          ? currentSelections.filter((id: string) => id !== option.id)
                          : [...currentSelections, option.id]
                        handleResponse(poll.id, newSelections)
                      } else {
                        handleResponse(poll.id, option.id)
                      }
                    }}
                    disabled={isSubmitted}
                  >
                    {option.text}
                  </Button>
                )
              })}
            </div>
            {poll.data.allowMultipleAnswers && (
              <p className="text-xs text-muted-foreground">You can select multiple options</p>
            )}
          </div>
        )
      case "word-cloud":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{poll.data.question}</h2>
            <div className="space-y-2">
              <Input
                value={textInputs[poll.id] || ""}
                onChange={(e) => handleTextInput(poll.id, e.target.value)}
                placeholder="Enter your words or phrases"
                className="w-full"
                disabled={isSubmitted}
              />
              <Button
                onClick={() => handleTextSubmit(poll.id)}
                disabled={!textInputs[poll.id]?.trim() || isSubmitted}
                className="w-full"
              >
                Submit
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              You can submit up to {poll.data.maxEntries} word{poll.data.maxEntries > 1 ? "s" : ""}
            </p>
          </div>
        )
      case "open-ended":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{poll.data.question}</h2>
            <div className="space-y-2">
              <Textarea
                value={textInputs[poll.id] || ""}
                onChange={(e) => handleTextInput(poll.id, e.target.value)}
                placeholder="Type your response here..."
                className="w-full min-h-[100px]"
                maxLength={poll.data.maxResponseLength || undefined}
                disabled={isSubmitted}
              />
              {poll.data.maxResponseLength ? (
                <p className="text-xs text-muted-foreground">Maximum {poll.data.maxResponseLength} characters</p>
              ) : null}
            </div>
          </div>
        )
      case "scale":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{poll.data.question}</h2>
            <div className="p-6 bg-gray-100 rounded-md">
              <div className="flex justify-between mb-2">
                <span className="text-sm">{poll.data.minLabel || poll.data.min}</span>
                <span className="text-sm">{poll.data.maxLabel || poll.data.max}</span>
              </div>
              <div className="flex justify-around py-4">
                {Array.from({ length: (poll.data.max - poll.data.min) / poll.data.step + 1 }).map((_, i) => {
                  const value = poll.data.min + i * poll.data.step
                  const isSelected = scaleValues[poll.id] === value

                  return (
                    <Button
                      key={i}
                      variant={isSelected ? "default" : "outline"}
                      className={`rounded-full w-10 h-10 p-0 ${isSelected ? "ring-2 ring-primary" : ""}`}
                      onClick={() => handleScaleChange(poll.id, value)}
                      disabled={isSubmitted}
                    >
                      {value}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>
        )
      case "ranking":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{poll.data.question}</h2>
            <p className="text-sm text-muted-foreground mb-2">
              Arrange items in order of preference using the up and down buttons
            </p>
            <div className="space-y-2">
              {(rankingOrder[poll.id] || poll.data.options.map((o) => o.id)).map((itemId, index) => {
                const option = poll.data.options.find((o) => o.id === itemId)
                if (!option) return null

                return (
                  <div
                    key={option.id}
                    className="p-4 bg-white rounded-md border border-gray-200 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                        {index + 1}
                      </div>
                      <span>{option.text}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRankingChange(poll.id, option.id, "up")}
                        disabled={index === 0 || isSubmitted}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRankingChange(poll.id, option.id, "down")}
                        disabled={index === poll.data.options.length - 1 || isSubmitted}
                      >
                        ↓
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      case "qa":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{poll.data.title}</h2>
            {poll.data.description && <p className="text-gray-700 mb-4">{poll.data.description}</p>}
            <div className="space-y-2">
              <Textarea
                value={textInputs[poll.id] || ""}
                onChange={(e) => handleTextInput(poll.id, e.target.value)}
                placeholder="Type your question here..."
                className="w-full min-h-[100px]"
                disabled={isSubmitted}
              />
              <Button
                onClick={() => handleTextSubmit(poll.id)}
                disabled={!textInputs[poll.id]?.trim() || isSubmitted}
                className="w-full"
              >
                Submit Question
              </Button>
            </div>
            {poll.data.allowAnonymous && (
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="anonymous" disabled={isSubmitted} />
                <label htmlFor="anonymous" className="text-sm">
                  Submit anonymously
                </label>
              </div>
            )}
          </div>
        )
      case "quiz":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{poll.data.question}</h2>
            <div className="space-y-3">
              {poll.data.options.map((option) => {
                const isSelected = responses[poll.id] === option.id

                return (
                  <Button
                    key={option.id}
                    variant={isSelected ? "default" : "outline"}
                    className="w-full justify-start h-auto py-3 px-4 text-left"
                    onClick={() => handleResponse(poll.id, option.id)}
                    disabled={isSubmitted}
                  >
                    {option.text}
                  </Button>
                )
              })}
            </div>
            {responses[poll.id] && poll.data.showCorrectAnswer && isSubmitted && (
              <div className="p-4 rounded-md bg-green-50 border border-green-200">
                <p className="font-medium text-green-700">
                  {poll.data.options.find((o) => o.id === responses[poll.id])?.isCorrect
                    ? "Correct!"
                    : "Incorrect. Try again!"}
                </p>
              </div>
            )}
          </div>
        )
      case "image-choice":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{poll.data.question}</h2>
            <div className="grid grid-cols-2 gap-4">
              {poll.data.options.map((option) => {
                const isSelected = responses[poll.id] === option.id

                return (
                  <div
                    key={option.id}
                    className={`border rounded-md p-2 cursor-pointer transition-all ${
                      isSelected ? "ring-2 ring-primary border-primary" : "bg-white hover:bg-gray-50"
                    }`}
                    onClick={() => !isSubmitted && handleResponse(poll.id, option.id)}
                  >
                    <img
                      src={option.imageUrl || "/placeholder.svg"}
                      alt={option.caption || "Image option"}
                      className="w-full h-40 object-contain mb-2"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=150&width=200"
                      }}
                    />
                    {option.caption && <p className="text-center font-medium">{option.caption}</p>}
                  </div>
                )
              })}
            </div>
          </div>
        )
      default:
        return <div>Unknown poll type</div>
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-md max-w-md text-center">{error}</div>
      </div>
    )
  }

  const hasContent = sessionData?.content && sessionData.content.length > 0
  const currentSlide = hasContent ? sessionData.content[currentSlideIndex] : null
  const isCurrentPollSubmitted = currentSlide ? submittedPolls.includes(currentSlide.id) : false

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground p-4 transition-colors duration-300">
        <div className="container flex justify-between items-center">
          <div className="font-medium">{sessionData.title}</div>
          <div className="text-sm">Joined as: {participantName}</div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 container py-6 flex items-center justify-center transition-colors duration-300 bg-gray-50">
        {!hasContent ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Waiting for content</h2>
            <p className="text-muted-foreground">The presenter has not shared any content yet.</p>
          </div>
        ) : (
          <Card className="w-full max-w-2xl shadow-lg transition-colors duration-300 border-gray-200">
            <CardContent className="p-6">{renderPollParticipation(currentSlide)}</CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <div className="text-sm text-muted-foreground">
                Question {currentSlideIndex + 1} of {sessionData.content.length}
              </div>
              <Button
                onClick={() => submitResponse(currentSlide.id)}
                disabled={!responses[currentSlide.id] || isSubmitting || isCurrentPollSubmitted}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : isCurrentPollSubmitted ? (
                  "Submitted"
                ) : (
                  "Submit Answer"
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
      </main>
    </div>
  )
}
