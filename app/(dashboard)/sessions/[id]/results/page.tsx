"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Coins,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { PollType } from "@/types/poll-types"

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
    return responses.filter((r) => r.poll_id === pollId)
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
                fontSize: \`${Math.max(0.8, Math.min(2, 0.8 + (count / Math.max(...(Object.values(wordCounts) as number[]))) * 1.2)}rem`,\
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
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: \`${percentage}%` }}></div>
                </div>
              </div>
            )
    \
  }
  )
}
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

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {sessionData.content.map((poll: any, index: number) => (
              <TabsTrigger key={poll.id} value={poll.id}>
                Question {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              {sessionData.content.map((poll: any, index: number) => (
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
                      {poll.type === "points-allocation" && `100 Points: ${poll.data.question}`}
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
                        {poll.type === "points-allocation" && <Coins className="h-5 w-5 text-amber-500" />}
                        <span className="capitalize">{poll.type.replace(/-/g, " ")}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{getResponseCountForPoll(poll.id)} responses</div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" onClick={() => setActiveTab(poll.id)}>
                      View Details
                    </Button>
                  </CardFooter>
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
    </div>
  )
\
}
