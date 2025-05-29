"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, BarChart3, PieChart, CloudRain, MessageSquare, SlidersHorizontal, Coins } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import type { PollType } from "@/types/poll-types"

// Create a Supabase client for public access
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function PublicResultsPage() {
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [sessionData, setSessionData] = useState<any>(null)
  const [responses, setResponses] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("overview")

  useEffect(() => {
    async function fetchSessionAndResponses() {
      if (!params.id) return

      try {
        // Fetch session data using the public API
        const sessionResponse = await fetch(`/api/public/sessions/${params.id}`)

        if (!sessionResponse.ok) {
          const errorData = await sessionResponse.json()
          throw new Error(errorData.message || "Failed to load session")
        }

        const sessionData = await sessionResponse.json()
        setSessionData(sessionData)

        // Fetch responses for this session
        const { data: responsesData, error: responsesError } = await supabase
          .from("responses")
          .select("*")
          .eq("session_id", params.id)

        if (responsesError) throw responsesError

        setResponses(responsesData || [])
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError(err.message || "Failed to load session data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessionAndResponses()
  }, [params.id])

  const getUniqueParticipants = () => {
    const uniqueNames = new Set(responses.map((r) => r.participant_name))
    return uniqueNames.size
  }

  const getResponseCountForPoll = (pollId: string) => {
    return responses.filter((r) => r.poll_id === pollId).length
  }

  const getResponsesForPoll = (pollId: string) => {
    return responses.filter((r) => r.poll_id === pollId)
  }

  const renderSliderResults = (poll: any, pollResponses: any[]) => {
    // Calculate average position
    const sum = pollResponses.reduce((acc, response) => acc + response.response, 0)
    const average = sum / pollResponses.length

    // Calculate average as percentage
    const averagePercentage = Math.round((average / (poll.data.steps - 1)) * 100)

    // Find the most common position
    const positionCounts: Record<number, number> = {}
    for (let i = 0; i < poll.data.steps; i++) {
      positionCounts[i] = 0
    }

    pollResponses.forEach((response) => {
      const position = response.response
      positionCounts[position] = (positionCounts[position] || 0) + 1
    })

    let mostCommonPosition = 0
    let maxCount = 0
    Object.entries(positionCounts).forEach(([position, count]: any) => {
      if (count > maxCount) {
        maxCount = count
        mostCommonPosition = Number(position)
      }
    })

    // Calculate most common as percentage
    const mostCommonPercentage = Math.round((mostCommonPosition / (poll.data.steps - 1)) * 100)

    // Sort responses by participant name for consistent display
    const sortedResponses = [...pollResponses].sort((a, b) =>
      (a.participant_name || "Anonymous").localeCompare(b.participant_name || "Anonymous"),
    )

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{poll.data.question}</h3>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 mb-1">Average Position</p>
            <p className="text-2xl font-bold text-blue-700">{averagePercentage}%</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 mb-1">Most Common</p>
            <p className="text-2xl font-bold text-green-700">{mostCommonPercentage}%</p>
            <p className="text-xs text-green-600">{positionCounts[mostCommonPosition]} responses</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-600 mb-1">Total Responses</p>
            <p className="text-2xl font-bold text-purple-700">{pollResponses.length}</p>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between mb-4">
            <span className="font-medium text-sm">{poll.data.leftOption}</span>
            <span className="font-medium text-sm">{poll.data.rightOption}</span>
          </div>

          <div className="relative h-16 bg-gray-50 rounded-lg border border-gray-100">
            {/* Response dots */}
            {pollResponses.map((response, idx) => {
              const position = response.response
              const percentage = (position / (poll.data.steps - 1)) * 100

              return (
                <div
                  key={idx}
                  className="absolute w-4 h-4 rounded-full bg-primary transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${percentage}%`,
                    top: "50%",
                    opacity: 0.7,
                  }}
                  title={`${response.participant_name}: ${percentage}%`}
                />
              )
            })}

            {/* Average marker */}
            <div
              className="absolute w-6 h-6 rounded-full bg-blue-500 border-2 border-white transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
              style={{
                left: `${(average / (poll.data.steps - 1)) * 100}%`,
                top: "50%",
                zIndex: 10,
              }}
              title={`Average: ${averagePercentage}%`}
            >
              <span className="text-white text-xs">A</span>
            </div>
          </div>

          <div className="flex justify-between mt-2">
            <div className="text-xs text-muted-foreground">0%</div>
            <div className="text-xs text-muted-foreground">50%</div>
            <div className="text-xs text-muted-foreground">100%</div>
          </div>
        </div>

        {/* Individual participant responses */}
        <div className="mt-8">
          <h4 className="text-sm font-medium mb-4">Individual Responses</h4>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {sortedResponses.map((response, index) => {
              const position = response.response
              const percentage = Math.round((position / (poll.data.steps - 1)) * 100)

              return (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{response.participant_name || "Anonymous"}</span>
                    <span className="text-xs px-2 py-1 bg-primary/10 rounded-full text-primary font-medium">
                      {percentage}%
                    </span>
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded-full">
                    <div className="absolute h-2 bg-primary rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-4">Total responses: {pollResponses.length}</p>
      </div>
    )
  }

  const renderPollResults = (poll: PollType) => {
    const pollResponses = getResponsesForPoll(poll.id)

    if (pollResponses.length === 0) {
      return (
        <div className="p-6 text-center bg-gray-50 rounded-lg">
          <p className="text-muted-foreground">No responses yet</p>
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
      default:
        return <div>Unsupported poll type</div>
    }
  }

  const renderPointsAllocationResults = (poll: any, pollResponses: any[]) => {
    // Calculate total points allocated by each participant
    const participantPoints: Record<string, number> = {}
    pollResponses.forEach((response) => {
      const participantName = response.participant_name || "Anonymous"
      // Handle both formats: direct points object or wrapped in allocation
      const responseData = response.response?.allocation || response.response

      if (typeof responseData === "object") {
        participantPoints[participantName] = Object.values(responseData).reduce(
          (sum: any, points: any) => sum + points,
          0,
        )
      }
    })

    // Calculate average points for each option
    const optionPoints: Record<string, number> = {}
    const optionCounts: Record<string, number> = {}
    poll.data.options.forEach((option: any) => {
      optionPoints[option.id] = 0
      optionCounts[option.id] = 0
    })

    pollResponses.forEach((response) => {
      // Handle both formats: direct points object or wrapped in allocation
      const responseData = response.response?.allocation || response.response

      if (typeof responseData === "object") {
        Object.entries(responseData).forEach(([optionId, points]: any) => {
          optionPoints[optionId] = (optionPoints[optionId] || 0) + points
          optionCounts[optionId] = (optionCounts[optionId] || 0) + 1
        })
      }
    })

    const averagePoints: Record<string, number> = {}
    Object.keys(optionPoints).forEach((optionId) => {
      averagePoints[optionId] = optionPoints[optionId] / pollResponses.length || 0
    })

    // Sort options by average points
    const sortedOptions = [...poll.data.options].sort((a: any, b: any) => averagePoints[b.id] - averagePoints[a.id])

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{poll.data.question}</h3>

        <div className="space-y-3">
          {sortedOptions.map((option: any) => {
            const avgPoints = averagePoints[option.id] || 0
            const totalPoints = optionPoints[option.id] || 0
            const maxAvg = Math.max(...Object.values(averagePoints))

            return (
              <div key={option.id} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <p className="font-medium">{option.text}</p>
                  <div className="text-right">
                    <div className="font-bold">{totalPoints} pts</div>
                    <div className="text-sm text-muted-foreground">Avg: {avgPoints.toFixed(1)} pts per participant</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${maxAvg > 0 ? Math.round((avgPoints / maxAvg) * 100) : 0}%` }}
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
      const word = response.response.toLowerCase().trim()
      wordCounts[word] = (wordCounts[word] || 0) + 1
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
          {pollResponses.map((response, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start">
                <p className="whitespace-pre-wrap">{response.response}</p>
                <span className="text-xs text-muted-foreground ml-2">{response.participant_name}</span>
              </div>
            </div>
          ))}
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="border-b">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">GroupPulse Results</h1>
            </div>
          </div>
        </header>
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
        <header className="border-b">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">GroupPulse Results</h1>
            </div>
          </div>
        </header>
        <main className="flex-1 container py-6">
          <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">GroupPulse Results</h1>
          </div>
          <div className="text-sm text-muted-foreground">Session: {sessionData?.title}</div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Results: {sessionData.title}</h1>
          {sessionData.description && <p className="text-muted-foreground mt-2">{sessionData.description}</p>}
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

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {sessionData?.content.map((poll: any, index: number) => (
              <TabsTrigger key={poll.id} value={poll.id}>
                Question {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              {sessionData?.content.map((poll: any, index: number) => (
                <Card key={poll.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                    <CardDescription>
                      {poll.type === "multiple-choice" && `Multiple Choice: ${poll.data.question}`}
                      {poll.type === "word-cloud" && `Word Cloud: ${poll.data.question}`}
                      {poll.type === "open-ended" && `Open-ended: ${poll.data.question}`}
                      {poll.type === "scale" && `Scale: ${poll.data.question}`}
                      {poll.type === "slider" && `Slider: ${poll.data.question}`}
                      {poll.type === "ranking" && `Ranking: ${poll.data.question}`}
                      {poll.type === "qa" && `Q&A: ${poll.data.title}`}
                      {poll.type === "quiz" && `Quiz: ${poll.data.question}`}
                      {poll.type === "image-choice" && `Image Choice: ${poll.data.question}`}
                      {poll.type === "points-allocation" && `Points Allocation: ${poll.data.question}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {poll.type === "multiple-choice" && <BarChart3 className="h-5 w-5 text-blue-500" />}
                        {poll.type === "word-cloud" && <CloudRain className="h-5 w-5 text-purple-500" />}
                        {poll.type === "open-ended" && <MessageSquare className="h-5 w-5 text-green-500" />}
                        {poll.type === "scale" && <BarChart3 className="h-5 w-5 text-amber-500" />}
                        {poll.type === "slider" && <SlidersHorizontal className="h-5 w-5 text-teal-500" />}
                        {poll.type === "ranking" && <BarChart3 className="h-5 w-5 text-red-500" />}
                        {poll.type === "qa" && <MessageSquare className="h-5 w-5 text-cyan-500" />}
                        {poll.type === "quiz" && <BarChart3 className="h-5 w-5 text-indigo-500" />}
                        {poll.type === "image-choice" && <PieChart className="h-5 w-5 text-pink-500" />}
                        {poll.type === "points-allocation" && <Coins className="h-5 w-5 text-orange-500" />}
                        <span className="capitalize">{poll.type.replace(/-/g, " ")}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{getResponseCountForPoll(poll.id)} responses</div>
                    </div>
                  </CardContent>
                  <CardContent className="pt-0">
                    <Button variant="outline" onClick={() => setActiveTab(poll.id)}>
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {sessionData.content.map((poll: any) => (
            <TabsContent key={poll.id} value={poll.id}>
              <Card>
                <CardHeader>
                  <CardTitle>Results</CardTitle>
                  <CardDescription>{getResponseCountForPoll(poll.id)} responses received</CardDescription>
                </CardHeader>
                <CardContent>{renderPollResults(poll)}</CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </main>
      <footer className="border-t py-4">
        <div className="container text-center text-sm text-muted-foreground">Powered by GroupPulse</div>
      </footer>
    </div>
  )
}
