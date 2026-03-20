"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CircleDot } from "lucide-react"
import type { PointsAllocationPoll } from "@/types/poll-types"

interface PointsAllocationParticipantProps {
  poll: PointsAllocationPoll
  onSubmit: (response: Record<string, number>) => void
  onChange?: (response: Record<string, number>) => void
  disabled?: boolean
}

export function PointsAllocationParticipant({ poll, onSubmit, onChange, disabled }: PointsAllocationParticipantProps) {
  const { question, totalPoints, options, minPointsPerOption = 0, maxPointsPerOption } = poll.data

  const [allocations, setAllocations] = useState<Record<string, number>>(
    Object.fromEntries(options.map((opt) => [opt.id, 0]))
  )
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const usedPoints = Object.values(allocations).reduce((sum, val) => sum + val, 0)
  const remainingPoints = totalPoints - usedPoints

  // Report allocations to parent on every change so "Submit All" can capture them
  useEffect(() => {
    if (usedPoints > 0) {
      if (onChange) onChange(allocations)
      else if (!hasSubmitted) onSubmit(allocations)
    }
  }, [allocations])

  const handleChange = (optionId: string, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0)
    const effectiveMax = maxPointsPerOption ?? totalPoints
    const clampedValue = Math.min(numValue, effectiveMax)

    setAllocations((prev) => ({
      ...prev,
      [optionId]: clampedValue,
    }))
  }

  const handleSubmit = () => {
    if (remainingPoints < 0) return

    const belowMin = options.some((opt) => allocations[opt.id] < minPointsPerOption)
    if (belowMin) return

    setHasSubmitted(true)
    onSubmit(allocations)
  }

  const isValid =
    remainingPoints >= 0 &&
    options.every((opt) => allocations[opt.id] >= minPointsPerOption)

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CircleDot className="h-5 w-5 text-purple-500" />
          {question}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Allocate {totalPoints} points across the options below
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-2">
          <span className="text-sm font-medium">Points remaining</span>
          <span className={`text-lg font-bold ${remainingPoints < 0 ? "text-red-500" : "text-primary"}`}>
            {remainingPoints}
          </span>
        </div>

        <div className="space-y-3">
          {options.map((option) => (
            <div key={option.id} className="flex items-center gap-3">
              <label className="flex-1 text-sm font-medium">{option.text}</label>
              <Input
                type="number"
                min={minPointsPerOption}
                max={maxPointsPerOption ?? totalPoints}
                value={allocations[option.id]}
                onChange={(e) => handleChange(option.id, e.target.value)}
                disabled={disabled || hasSubmitted}
                className="w-24 text-center"
              />
            </div>
          ))}
        </div>

        {remainingPoints < 0 && (
          <p className="text-sm text-red-500">You've allocated too many points. Please adjust.</p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={disabled || hasSubmitted || !isValid}
          className="w-full"
        >
          {hasSubmitted ? "Submitted" : "Submit Allocation"}
        </Button>
      </CardContent>
    </Card>
  )
}
