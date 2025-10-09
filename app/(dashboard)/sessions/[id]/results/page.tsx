"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Loader2,
  ArrowLeft,
  Share2,
  BarChart3,
  PieChart,
  CloudRain,
  MessageSquare,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { PollType } from "@/types/poll-types"
import WhiteboardCanvas from "@/components/whiteboard-canvas"

export default function ResultsPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [sessionData, setSessionData] = useState<any>(null)
  const [responses, setResponses] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("overview")

  async function fetchSessionAndResponses() {
    if (!session?.user?.id || !params.id) return

    try {
      // Fetch session data
      const { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", params.id)
        .single()

      if (sessionError) throw sessionError

      if (!sessionData) {
        setError("Session not found")
        return
      }

      setSessionData(sessionData)

      // Fetch responses for this session
      const { data: responsesData, error: responsesError } = await supabase
        .from("responses")
        .select("*")
        .eq("session_id", params.id)

      if (responsesError) throw responsesError

      console.log("Fetched responses:", responsesData)
      setResponses(responsesData || [])
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to load session data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchSessionAndResponses()
    } else if (status === "unauthenticated") {
      setIsLoading(false)
      setError("Please log in to view results")
    }
  }, [session, params.id, status])

  const getUniqueParticipants = () => {
    const uniqueNames = new Set(responses.map((r) => r.participant_name))
    return uniqueNames.size
  }

  const getResponseCountForPoll = (pollId: string) => {
    return responses.filter((r) => r.poll_id === pollId).length
  }

  const getResponsesForPoll = (pollId: string) => {
    const pollResponses = responses.filter((r) => r.poll_id === pollId)
    console.log(`[v0] Getting responses for poll ${pollId}:`, pollResponses.length, "responses")
    return pollResponses
  }

  const renderPollResults = (poll: PollType) => {
    const pollResponses = getResponsesForPoll(poll.id)

    console.log(`[v0] Rendering results for poll ${poll.id} (${poll.type}):`, pollResponses.length, "responses")

    if (pollResponses.length === 0) {
      return (
        <div className="p-6 text-center bg-gray-50 rounded-lg">
          <p className="text-muted-foreground">No responses yet</p>
          <p className="text-xs text-muted-foreground mt-2">Poll ID: {poll.id}</p>
        </div>
      )
    }

    switch (poll.type) {
      case "multiple-choice":
        return renderMultipleChoiceResults(poll, pollResponses)
      case "word-cloud":
        return renderWordCloudResults(poll, pollResponses)
      case "open-ended":
        return renderOpenEndedResults(poll, pollResponses)
      case "scale":
        return renderScaleResults(poll, pollResponses)
      case "slider":
        return renderSliderResults(poll, pollResponses)
      case "ranking":
        return renderRankingResults(poll, pollResponses)
      case "qa":
        return renderQAResults(poll, pollResponses)
      case "quiz":
        return renderQuizResults(poll, pollResponses)
      case "image-choice":
        return renderImageChoiceResults(poll, pollResponses)
      case "points-allocation":
        return renderPointsAllocationResults(poll, pollResponses)
      case "whiteboard":
        return renderWhiteboardResults(poll, pollResponses)
      default:
        return <div>Unsupported poll type</div>
    }
  }

  const renderMultipleChoiceResults = (poll: any, pollResponses: any[]) => {
    // Count responses for each option
    const counts: Record<string, number> = {}

    // Initialize counts for all options
    poll.data.options.forEach((option: any) => {
      counts[option.id] = 0
    })

    // Count responses
    pollResponses.forEach((response) => {
      if (poll.data.allowMultipleAnswers && Array.isArray(response.response)) {
        // For multiple selection, count each selected option
        response.response.forEach((optionId: string) => {
          counts[optionId] = (counts[optionId] || 0) + 1
        })
      } else {
        // For single selection
        counts[response.response] = (counts[response.response] || 0) + 1
      }
    })

    // Calculate percentages and prepare data for display
    const totalResponses = poll.data.allowMultipleAnswers
      ? Object.values(counts).reduce((sum: any, count: any) => sum + count, 0)
      : pollResponses.length

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{poll.data.question}</h3>
        <div className="space-y-3">
          {poll.data.options.map((option: any) => {
            const count = counts[option.id] || 0
            const percentage = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0

            return (
              <div key={option.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{option.text}</span>
                  <span className="font-medium">
                    {count} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-sm text-muted-foreground">Total responses: {pollResponses.length}</p>
      </div>
    )
  }

  const renderWordCloudResults = (poll: any, pollResponses: any[]) => {
    // In a real implementation, you would use a word cloud library
    // For now, we'll just show the words with frequency
    const wordCounts: Record<string, number> = {}

    pollResponses.forEach((response) => {
      // Ensure response.response is a string
      const responseText = typeof response.response === "string" ? response.response : String(response.response || "")

      const word = responseText.toLowerCase().trim()
      if (word) {
        wordCounts[word] = (wordCounts[word] || 0) + 1
      }
    })

    // Sort words by frequency
    const sortedWords = Object.entries(wordCounts).sort(([, countA]: any, [, countB]: any) => countB - countA)

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{poll.data.question}</h3>
        <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg min-h-[200px]">
          {sortedWords.map(([word, count]: any) => (
            <div
              key={word}
              className="bg-primary text-primary-foreground px-3 py-1 rounded-full"
              style={{
                fontSize: `${Math.max(0.8, Math.min(2, 0.8 + (count / Math.max(...(Object.values(wordCounts) as number[]))) * 1.2))}rem`,
              }}
            >
              {word} ({count})
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">Total responses: {pollResponses.length}</p>
      </div>
    )
  }

  const renderOpenEndedResults = (poll: any, pollResponses: any[]) => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{poll.data.question}</h3>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {pollResponses.map((response, index) => {
            // Ensure response.response is a string
            const responseText =
              typeof response.response === "string"
                ? response.response
                : typeof response.response === "object"
                  ? JSON.stringify(response.response)
                  : String(response.response || "")

            return (
              <div key={`${response.id || index}`} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <p className="whitespace-pre-wrap">{responseText}</p>
                  <span className="text-xs text-muted-foreground ml-2">{response.participant_name || "Anonymous"}</span>
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-sm text-muted-foreground">Total responses: {pollResponses.length}</p>
      </div>
    )
  }

  const renderScaleResults = (poll: any, pollResponses: any[]) => {
    // Calculate average
    const sum = pollResponses.reduce((acc, response) => acc + response.response, 0)
    const average = sum / pollResponses.length

    // Count responses for each value
    const valueCounts: Record<number, number> = {}
    for (let i = poll.data.min; i <= poll.data.max; i += poll.data.step) {
      valueCounts[i] = 0
    }

    pollResponses.forEach((response) => {
      valueCounts[response.response] = (valueCounts[response.response] || 0) + 1
    })

    // Find the most common value
    let mostCommonValue = poll.data.min
    let maxCount = 0

    Object.entries(valueCounts).forEach(([value, count]: any) => {
      if (count > maxCount) {
        maxCount = count
        mostCommonValue = Number.parseFloat(value)
      }
    })

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{poll.data.question}</h3>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 mb-1">Average</p>
            <p className="text-2xl font-bold text-blue-700">{average.toFixed(1)}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 mb-1">Most Common</p>
            <p className="text-2xl font-bold text-green-700">{mostCommonValue}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-600 mb-1">Responses</p>
            <p className="text-2xl font-bold text-purple-700">{pollResponses.length}</p>
          </div>
        </div>

        <div className="space-y-3">
          {Object.entries(valueCounts).map(([value, count]: any) => {
            const percentage = pollResponses.length > 0 ? Math.round((count / pollResponses.length) * 100) : 0

            return (
              <div key={value} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{value}</span>
                  <span className="font-medium">
                    {count} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderRankingResults = (poll: any, pollResponses: any[]) => {
    // Calculate average position for each option
    const positionSums: Record<string, number> = {}
    const positionCounts: Record<string, number> = {}

    // Initialize
    poll.data.options.forEach((option: any) => {
      positionSums[option.id] = 0
      positionCounts[option.id] = 0
    })

    // Sum up positions
    pollResponses.forEach((response) => {
      if (Array.isArray(response.response)) {
        response.response.forEach((optionId: string, index: number) => {
          positionSums[optionId] = (positionSums[optionId] || 0) + (index + 1)
          positionCounts[optionId] = (positionCounts[optionId] || 0) + 1
        })
      }
    })

    // Calculate average positions
    const averagePositions: Record<string, number> = {}
    Object.keys(positionSums).forEach((optionId) => {
      if (positionCounts[optionId] > 0) {
        averagePositions[optionId] = positionSums[optionId] / positionCounts[optionId]
      } else {
        averagePositions[optionId] = 0
      }
    })

    // Sort options by average position
    const sortedOptions = [...poll.data.options].sort((a: any, b: any) => {
      return averagePositions[a.id] - averagePositions[b.id]
    })

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{poll.data.question}</h3>
        <div className="space-y-3">
          {sortedOptions.map((option: any, index: number) => {
            const avgPosition = averagePositions[option.id]
            const percentage = 100 - ((avgPosition - 1) / (poll.data.options.length - 1)) * 100

            return (
              <div key={option.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  {index + 1}
                </div>
                <div className="flex-grow">
                  <p className="font-medium">{option.text}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">Avg: {avgPosition.toFixed(1)}</div>
              </div>
            )
          })}
        </div>
        <p className="text-sm text-muted-foreground">Total responses: {pollResponses.length}</p>
      </div>
    )
  }

  const renderQAResults = (poll: any, pollResponses: any[]) => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{poll.data.title}</h3>
        {poll.data.description && <p className="text-muted-foreground">{poll.data.description}</p>}

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {pollResponses.map((response, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium">Q:</p>
                <span className="text-xs text-muted-foreground">From: {response.participant_name}</span>
              </div>
              <p className="whitespace-pre-wrap pl-6">{response.response}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">Total questions: {pollResponses.length}</p>
      </div>
    )
  }

  const renderQuizResults = (poll: any, pollResponses: any[]) => {
    // Count responses for each option
    const counts: Record<string, number> = {}

    // Initialize counts for all options
    poll.data.options.forEach((option: any) => {
      counts[option.id] = 0
    })

    // Count responses
    pollResponses.forEach((response) => {
      counts[response.response] = (counts[response.response] || 0) + 1
    })

    // Calculate percentages and prepare data for display
    const totalResponses = pollResponses.length

    // Find correct option
    const correctOption = poll.data.options.find((option: any) => option.isCorrect)
    const correctCount = correctOption ? counts[correctOption.id] || 0 : 0
    const correctPercentage = totalResponses > 0 ? Math.round((correctCount / totalResponses) * 100) : 0

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{poll.data.question}</h3>

        <div className="p-4 bg-blue-50 rounded-lg mb-4">
          <div className="flex justify-between items-center">
            <p className="text-blue-700 font-medium">Correct Answers</p>
            <p className="text-blue-700 font-bold">{correctPercentage}%</p>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2.5 mt-2">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${correctPercentage}%` }}></div>
          </div>
        </div>

        <div className="space-y-3">
          {poll.data.options.map((option: any) => {
            const count = counts[option.id] || 0
            const percentage = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0

            return (
              <div key={option.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    {option.text}
                    {option.isCorrect && (
                      <span className="text-green-600 text-xs font-medium bg-green-100 px-2 py-0.5 rounded-full">
                        Correct
                      </span>
                    )}
                  </span>
                  <span className="font-medium">
                    {count} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${option.isCorrect ? "bg-green-500" : "bg-primary"}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-sm text-muted-foreground">Total responses: {pollResponses.length}</p>
      </div>
    )
  }

  const renderImageChoiceResults = (poll: any, pollResponses: any[]) => {
    // Count responses for each option
    const counts: Record<string, number> = {}

    // Initialize counts for all options
    poll.data.options.forEach((option: any) => {
      counts[option.id] = 0
    })

    // Count responses
    pollResponses.forEach((response) => {
      counts[response.response] = (counts[response.response] || 0) + 1
    })

    // Calculate percentages
    const totalResponses = pollResponses.length

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{poll.data.question}</h3>

        <div className="grid grid-cols-2 gap-4">
          {poll.data.options.map((option: any) => {
            const count = counts[option.id] || 0
            const percentage = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0

            return (
              <div key={option.id} className="border rounded-lg overflow-hidden">
                <div className="aspect-video bg-gray-100 relative">
                  <img
                    src={option.imageUrl || "/placeholder.svg"}
                    alt={option.caption || "Image option"}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=150&width=200"
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                    {percentage}%
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-medium text-center">{option.caption || `Option ${option.id}`}</p>
                  <p className="text-sm text-center text-muted-foreground mt-1">{count} votes</p>
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-sm text-muted-foreground">Total responses: {pollResponses.length}</p>
      </div>
    )
  }

  const renderPointsAllocationResults = (poll: any, pollResponses: any[]) => {
    console.log("Poll responses for points allocation:", pollResponses)
    console.log("Poll options:", poll.data.options)

    // Calculate total points allocated and average per option
    const optionTotals: Record<string, number> = {}
    const optionCounts: Record<string, number> = {}

    // Initialize with actual option IDs
    poll.data.options.forEach((option: any) => {
      optionTotals[option.id] = 0
      optionCounts[option.id] = 0
    })

    // Sum up points for each option
    pollResponses.forEach((response) => {
      console.log("Processing response:", response)

      // Handle multiple possible response formats
      let responseData = null

      if (response.response?.allocation) {
        responseData = response.response.allocation
      } else if (typeof response.response === "object" && response.response !== null) {
        responseData = response.response
      }

      console.log("Response data:", responseData)

      if (responseData && typeof responseData === "object") {
        Object.entries(responseData).forEach(([key, points]: any) => {
          console.log(`Processing key ${key}: ${points} points`)

          // Handle both numeric indices and actual option IDs
          let optionId = key

          // If the key is numeric, map it to the actual option ID
          if (!isNaN(Number(key))) {
            const optionIndex = Number(key)
            if (poll.data.options[optionIndex]) {
              optionId = poll.data.options[optionIndex].id
              console.log(`Mapped index ${optionIndex} to option ID ${optionId}`)
            }
          }

          // Only process if this is a valid option ID
          if (optionTotals.hasOwnProperty(optionId)) {
            console.log(`Adding ${points} points to option ${optionId}`)
            optionTotals[optionId] = (optionTotals[optionId] || 0) + points
            if (points > 0) {
              optionCounts[optionId] = (optionCounts[optionId] || 0) + 1
            }
          } else {
            console.log(`Skipping unknown option ID: ${optionId}`)
          }
        })
      }
    })

    console.log("Final option totals:", optionTotals)
    console.log("Final option counts:", optionCounts)

    // Calculate averages
    const optionAverages: Record<string, number> = {}
    Object.keys(optionTotals).forEach((optionId) => {
      optionAverages[optionId] = pollResponses.length > 0 ? optionTotals[optionId] / pollResponses.length : 0
    })

    console.log("Option averages:", optionAverages)

    // Sort options by total points
    const sortedOptions = [...poll.data.options].sort((a: any, b: any) => {
      return optionTotals[b.id] - optionTotals[a.id]
    })

    const totalPointsAllocated = Object.values(optionTotals).reduce((sum: any, points: any) => sum + points, 0)
    const maxPoints = Math.max(...(Object.values(optionTotals) as number[]))

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{poll.data.question}</h3>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-amber-50 rounded-lg">
            <p className="text-sm text-amber-600 mb-1">Total Points Allocated</p>
            <p className="text-2xl font-bold text-amber-700">{totalPointsAllocated}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 mb-1">Average per Participant</p>
            <p className="text-2xl font-bold text-blue-700">
              {pollResponses.length > 0 ? Math.round(totalPointsAllocated / pollResponses.length) : 0}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-600 mb-1">Responses</p>
            <p className="text-2xl font-bold text-purple-700">{pollResponses.length}</p>
          </div>
        </div>

        <div className="space-y-3">
          {sortedOptions.map((option: any, index: number) => {
            const totalPoints = optionTotals[option.id] || 0
            const averagePoints = optionAverages[option.id] || 0
            const percentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0

            return (
              <div key={option.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{option.text}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{totalPoints} pts</div>
                    <div className="text-sm font-medium text-amber-600">Avg: {averagePoints.toFixed(1)} pts</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-amber-500 h-3 rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-sm text-muted-foreground">Total responses: {pollResponses.length}</p>
      </div>
    )
  }

  const renderSliderResults = (poll: any, pollResponses: any[]) => {
    console.log("[v0] Slider poll data:", poll.data)
    console.log("[v0] Slider responses:", pollResponses)

    const values = pollResponses
      .map((response) => {
        if (typeof response.response === "object" && response.response?.value !== undefined) {
          return response.response.value
        } else if (typeof response.response === "number") {
          return response.response
        }
        return 0
      })
      .sort((a, b) => a - b)

    // Calculate mean
    const sum = values.reduce((acc, val) => acc + val, 0)
    const mean = pollResponses.length > 0 ? sum / pollResponses.length : 0

    // Calculate median
    let median = 0
    if (values.length > 0) {
      const mid = Math.floor(values.length / 2)
      median = values.length % 2 === 0 ? (values[mid - 1] + values[mid]) / 2 : values[mid]
    }

    // Calculate mode (most common value)
    const valueCounts: Record<number, number> = {}
    values.forEach((val) => {
      valueCounts[val] = (valueCounts[val] || 0) + 1
    })

    let mode = 0
    let maxCount = 0
    Object.entries(valueCounts).forEach(([value, count]) => {
      if (count > maxCount) {
        maxCount = count
        mode = Number(value)
      }
    })

    const maxValue = poll.data.steps - 1
    const meanPosition = (mean / maxValue) * 100
    const medianPosition = (median / maxValue) * 100
    const modePosition = (mode / maxValue) * 100

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">{poll.data.question}</h3>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{poll.data.leftOption}</span>
            <span>{poll.data.rightOption}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 mb-1">Mean</p>
            <p className="text-3xl font-bold text-blue-700">{mean.toFixed(1)}</p>
            <p className="text-xs text-blue-600 mt-1">
              Value: {mean.toFixed(1)} / {maxValue}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 mb-1">Median</p>
            <p className="text-3xl font-bold text-green-700">{median.toFixed(1)}</p>
            <p className="text-xs text-green-600 mt-1">
              Value: {median.toFixed(1)} / {maxValue}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-600 mb-1">Mode</p>
            <p className="text-3xl font-bold text-purple-700">{mode}</p>
            <p className="text-xs text-purple-600 mt-1">{maxCount} responses</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg">
            <p className="text-sm text-amber-600 mb-1">Responses</p>
            <p className="text-3xl font-bold text-amber-700">{pollResponses.length}</p>
          </div>
        </div>

        <div className="relative h-24 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-lg border-2 border-gray-200">
          {/* Slider track */}
          <div className="absolute inset-0 flex items-center px-4">
            <div className="w-full h-2 bg-gray-300 rounded-full" />
          </div>

          {/* Individual response dots */}
          {pollResponses.map((response, idx) => {
            let value = 0
            if (typeof response.response === "object" && response.response?.value !== undefined) {
              value = response.response.value
            } else if (typeof response.response === "number") {
              value = response.response
            }
            const position = (value / maxValue) * 100

            return (
              <div
                key={idx}
                className="absolute w-3 h-3 rounded-full bg-gray-400 transform -translate-x-1/2 -translate-y-1/2 hover:scale-150 transition-transform cursor-pointer"
                style={{
                  left: `${position}%`,
                  top: "50%",
                  opacity: 0.6,
                }}
                title={`${response.participant_name || "Anonymous"}: ${value}`}
              />
            )
          })}

          {/* Mean marker (blue) */}
          <div
            className="absolute w-8 h-8 rounded-full bg-blue-500 border-3 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10"
            style={{
              left: `${meanPosition}%`,
              top: "50%",
            }}
            title={`Mean: ${mean.toFixed(1)}`}
          >
            <span className="text-white text-xs font-bold">M</span>
          </div>

          {/* Median marker (green) */}
          <div
            className="absolute w-8 h-8 rounded-full bg-green-500 border-3 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10"
            style={{
              left: `${medianPosition}%`,
              top: "30%",
            }}
            title={`Median: ${median.toFixed(1)}`}
          >
            <span className="text-white text-xs font-bold">Md</span>
          </div>

          {/* Mode marker (purple) */}
          <div
            className="absolute w-8 h-8 rounded-full bg-purple-500 border-3 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10"
            style={{
              left: `${modePosition}%`,
              top: "70%",
            }}
            title={`Mode: ${mode} (${maxCount} responses)`}
          >
            <span className="text-white text-xs font-bold">Mo</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500" />
            <span>Mean: {mean.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span>Median: {median.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500" />
            <span>Mode: {mode}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span>Individual responses</span>
          </div>
        </div>
      </div>
    )
  }

  const renderWhiteboardResults = (poll: any, pollResponses: any[]) => {
    // Aggregate all whiteboard elements from all participants
    const allElements: any[] = []
    const participantColors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"]

    console.log("[v0] Processing whiteboard responses:", pollResponses)

    pollResponses.forEach((response, participantIndex) => {
      const participantColor = participantColors[participantIndex % participantColors.length]

      let responseData = response.response
      if (typeof responseData === "string") {
        try {
          responseData = JSON.parse(responseData)
        } catch (e) {
          console.log("[v0] Failed to parse response data:", e)
          responseData = { elements: [] }
        }
      }

      console.log("[v0] Parsed response data:", responseData)

      if (responseData?.elements && Array.isArray(responseData.elements)) {
        responseData.elements.forEach((element: any) => {
          allElements.push({
            ...element,
            participantId: response.participant_id || `participant-${participantIndex}`,
            participantName: response.participant_name || `Participant ${participantIndex + 1}`,
            participantColor: participantColor,
          })
        })
      }
    })

    console.log("[v0] All aggregated elements:", allElements)

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{String(poll.data.title)}</h3>
          <div className="text-sm text-muted-foreground">
            {pollResponses.length} participant{pollResponses.length !== 1 ? "s" : ""} • {allElements.length} elements
          </div>
        </div>

        {poll.data.instructions && <p className="text-muted-foreground">{String(poll.data.instructions)}</p>}

        {/* Participant Legend */}
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium mr-2">Participants:</span>
          {pollResponses.map((response, index) => (
            <div key={response.id || index} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: participantColors[index % participantColors.length] }}
              />
              <span className="text-xs">{response.participant_name || `Participant ${index + 1}`}</span>
            </div>
          ))}
        </div>

        {/* Collaborative Whiteboard Display */}
        <div className="border rounded-lg overflow-hidden bg-white">
          <div className="p-4 border-b bg-gray-50">
            <h4 className="font-medium">Collaborative Whiteboard Results</h4>
            <p className="text-sm text-muted-foreground">Combined contributions from all participants</p>
          </div>

          <div className="p-4 flex justify-center">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <WhiteboardCanvas
                width={Math.min(Math.max(poll.data.canvasWidth || 1200, 800), 1000)}
                height={Math.min(Math.max(poll.data.canvasHeight || 700, 500), 600)}
                backgroundColor={poll.data.backgroundColor || "#ffffff"}
                allowDrawing={false}
                allowStickyNotes={false}
                allowText={false}
                readOnly={true}
                elements={allElements}
              />
            </div>
          </div>
        </div>

        {/* Individual Participant Contributions */}
        <div className="space-y-4">
          <h4 className="font-medium">Individual Contributions</h4>
          <div className="grid gap-4 md:grid-cols-2">
            {pollResponses.map((response, index) => {
              let responseData = response.response
              if (typeof responseData === "string") {
                try {
                  responseData = JSON.parse(responseData)
                } catch (e) {
                  responseData = { elements: [] }
                }
              }

              const participantElements = responseData?.elements || []
              const participantColor = participantColors[index % participantColors.length]

              return (
                <div key={response.id || index} className="border rounded-lg overflow-hidden">
                  <div className="p-3 border-b bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: participantColor }} />
                      <span className="font-medium">{response.participant_name || `Participant ${index + 1}`}</span>
                      <span className="text-sm text-muted-foreground">
                        ({participantElements.length} element{participantElements.length !== 1 ? "s" : ""})
                      </span>
                    </div>
                  </div>

                  <div className="p-3">
                    {participantElements.length > 0 ? (
                      <div className="space-y-2">
                        {participantElements.map((element: any, elemIndex: number) => (
                          <div key={elemIndex} className="text-sm p-2 bg-gray-50 rounded">
                            <div className="flex justify-between items-center">
                              <span className="font-medium capitalize">
                                {element.type?.replace("-", " ") || "Unknown"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {element.timestamp && new Date(element.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            {element.content && <p className="mt-1 text-muted-foreground">{element.content}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No contributions from this participant
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Total responses: {pollResponses.length} • Total elements: {allElements.length}
        </p>
      </div>
    )
  }

  const handleShareResults = () => {
    // Generate a shareable link for results
    const shareableLink = `${window.location.origin}/sessions/${params.id}/results/public`

    // Copy to clipboard
    try {
      navigator.clipboard.writeText(shareableLink)
      toast.success("Results link copied to clipboard")
    } catch (err) {
      console.error("Failed to copy link:", err)
      // Fallback method for clipboard
      const textArea = document.createElement("textarea")
      textArea.value = shareableLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      toast.success("Results link copied to clipboard")
    }
  }

  const handleResetPoll = async (pollId?: string) => {
    try {
      const url = pollId ? `/api/sessions/${params.id}/reset?pollId=${pollId}` : `/api/sessions/${params.id}/reset`

      const response = await fetch(url, {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to reset responses")
      }

      toast.success(pollId ? "Poll responses reset successfully" : "All responses reset successfully")

      // Refresh the data
      fetchSessionAndResponses()
    } catch (err: any) {
      console.error("Error resetting responses:", err)
      toast.error(err.message || "Failed to reset responses")
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 container py-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 container py-6">
          <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
          <Button className="mt-4" onClick={() => router.push("/sessions")}>
            Back to Sessions
          </Button>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push(`/sessions/${params.id}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Results: {sessionData.title}</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleResetPoll()}
              className="gap-2"
              disabled={responses.length === 0}
            >
              <RefreshCw className="h-4 w-4" /> Reset All Responses
            </Button>
            <Button onClick={handleShareResults} className="gap-2">
              <Share2 className="h-4 w-4" /> Share Results
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{responses.length}</div>
              <p className="text-xs text-muted-foreground">
                {responses.length === 0 ? "No responses yet" : `From ${getUniqueParticipants()} participants`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sessionData.content.length > 0 && getUniqueParticipants() > 0
                  ? `${Math.round((responses.length / (sessionData.content.length * getUniqueParticipants())) * 100)}%`
                  : "0%"}
              </div>
              <p className="text-xs text-muted-foreground">Average responses per question</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Session Status</CardTitle>
              <CloudRain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{sessionData.status}</div>
              <p className="text-xs text-muted-foreground">
                {sessionData.status === "active" ? "Currently accepting responses" : "Not accepting responses"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {sessionData.content.map((poll: any, index: number) => {
            const pollResponses = getResponsesForPoll(poll.id)

            return (
              <Card key={poll.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        {poll.type === "slider" && <SlidersHorizontal className="h-4 w-4 text-teal-500" />}
                        {poll.type === "multiple-choice" && <BarChart3 className="h-4 w-4 text-blue-500" />}
                        {poll.type === "word-cloud" && <CloudRain className="h-4 w-4 text-purple-500" />}
                        {poll.type === "open-ended" && <MessageSquare className="h-4 w-4 text-green-500" />}
                        {poll.type === "scale" && <BarChart3 className="h-4 w-4 text-amber-500" />}
                        <span className="capitalize">{poll.type.replace(/-/g, " ")}</span>
                      </CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {pollResponses.length} response{pollResponses.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {pollResponses.length === 0 ? (
                    <div className="p-6 text-center bg-gray-50 rounded-lg">
                      <p className="text-muted-foreground">No responses yet</p>
                    </div>
                  ) : (
                    renderPollResults(poll)
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
