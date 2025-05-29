"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Coins, AlertCircle } from "lucide-react"
import type { PointsAllocationPoll } from "@/types/poll-types"

interface PointsAllocationParticipantProps {
  poll: PointsAllocationPoll
  onSubmit: (response: Record<string, number>) => void
  disabled?: boolean
}

export function PointsAllocationParticipant({ poll, onSubmit, disabled }: PointsAllocationParticipantProps) {
  const [allocation, setAllocation] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)

  // Initialize allocation with 0 points for each option
  useEffect(() => {
    const initialAllocation: Record<string, number> = {}
    poll.data.options.forEach((option) => {
      initialAllocation[option.id] = 0
    })
    setAllocation(initialAllocation)
  }, [poll.data.options])

  const totalAllocated = Object.values(allocation).reduce((sum, points) => sum + points, 0)
  const remainingPoints = poll.data.totalPoints - totalAllocated

  const handlePointsChange = (optionId: string, value: string) => {
    const points = Number.parseInt(value) || 0

    // Validate constraints
    if (poll.data.minPointsPerOption && points < poll.data.minPointsPerOption && points > 0) {
      setError(`Minimum ${poll.data.minPointsPerOption} points per option`)
      return
    }

    if (poll.data.maxPointsPerOption && points > poll.data.maxPointsPerOption) {
      setError(`Maximum ${poll.data.maxPointsPerOption} points per option`)
      return
    }

    const newAllocation = { ...allocation, [optionId]: points }
    const newTotal = Object.values(newAllocation).reduce((sum, p) => sum + p, 0)

    if (newTotal > poll.data.totalPoints) {
      setError(`Cannot exceed ${poll.data.totalPoints} total points`)
      return
    }

    setError(null)
    setAllocation(newAllocation)
  }

  const handleSubmit = () => {
    // Validate total allocation
    if (totalAllocated === 0) {
      setError("Please allocate at least some points")
      return
    }

    // Check minimum constraints
    if (poll.data.minPointsPerOption) {
      const hasInvalidAllocation = Object.values(allocation).some(
        (points) => points > 0 && points < poll.data.minPointsPerOption!,
      )
      if (hasInvalidAllocation) {
        setError(`Each option must have at least ${poll.data.minPointsPerOption} points or 0 points`)
        return
      }
    }

    onSubmit(allocation)
  }

  const distributeEvenly = () => {
    const pointsPerOption = Math.floor(poll.data.totalPoints / poll.data.options.length)
    const remainder = poll.data.totalPoints % poll.data.options.length

    const newAllocation: Record<string, number> = {}
    poll.data.options.forEach((option, index) => {
      newAllocation[option.id] = pointsPerOption + (index < remainder ? 1 : 0)
    })

    setAllocation(newAllocation)
    setError(null)
  }

  const clearAllocation = () => {
    const newAllocation: Record<string, number> = {}
    poll.data.options.forEach((option) => {
      newAllocation[option.id] = 0
    })
    setAllocation(newAllocation)
    setError(null)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-amber-500" />
          {poll.data.question}
        </CardTitle>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Distribute {poll.data.totalPoints} points among the options</span>
          <div className="flex items-center gap-2">
            <span
              className={`font-medium ${remainingPoints < 0 ? "text-red-600" : remainingPoints === 0 ? "text-green-600" : "text-blue-600"}`}
            >
              {remainingPoints} points remaining
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={distributeEvenly}>
            Distribute Evenly
          </Button>
          <Button variant="outline" size="sm" onClick={clearAllocation}>
            Clear All
          </Button>
        </div>

        <div className="space-y-4">
          {poll.data.options.map((option) => (
            <div key={option.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1">
                <Label htmlFor={`option-${option.id}`} className="text-sm font-medium">
                  {option.text}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id={`option-${option.id}`}
                  type="number"
                  min="0"
                  max={poll.data.maxPointsPerOption || poll.data.totalPoints}
                  value={allocation[option.id] || 0}
                  onChange={(e) => handlePointsChange(option.id, e.target.value)}
                  className="w-20 text-center"
                  disabled={disabled}
                />
                <span className="text-sm text-muted-foreground">pts</span>
              </div>
            </div>
          ))}
        </div>

        {poll.data.minPointsPerOption && (
          <p className="text-xs text-muted-foreground">
            Minimum {poll.data.minPointsPerOption} points per option (or 0 to skip)
          </p>
        )}

        {poll.data.maxPointsPerOption && (
          <p className="text-xs text-muted-foreground">Maximum {poll.data.maxPointsPerOption} points per option</p>
        )}

        <div className="pt-4">
          <Button
            onClick={handleSubmit}
            disabled={disabled || totalAllocated === 0 || remainingPoints < 0}
            className="w-full"
          >
            Submit ({totalAllocated}/{poll.data.totalPoints} points allocated)
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
