"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus } from "lucide-react"

interface PointsAllocationParticipantProps {
  poll: any
  onSubmit: (data: any) => void
  disabled: boolean
}

export function PointsAllocationParticipant({ poll, onSubmit, disabled }: PointsAllocationParticipantProps) {
  const pollData = poll.data || {}

  // Extract options safely
  const options = (() => {
    const rawOptions = pollData.options || []
    return rawOptions.map((option: any, index: number) => {
      if (typeof option === "string") return { id: `option-${index}`, text: option }
      if (option && typeof option === "object") {
        return {
          id: option.id || `option-${index}`,
          text: option.text || option.id || `Option ${index + 1}`,
        }
      }
      return { id: `option-${index}`, text: `Option ${index + 1}` }
    })
  })()

  const totalPoints = pollData.totalPoints || 100
  const minPointsPerOption = pollData.minPointsPerOption || 0
  const maxPointsPerOption = pollData.maxPointsPerOption || totalPoints

  const [allocation, setAllocation] = useState<Record<string, number>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize allocation with zeros
  useEffect(() => {
    const initialAllocation: Record<string, number> = {}
    options.forEach((option) => {
      initialAllocation[option.id] = 0
    })
    setAllocation(initialAllocation)
  }, [options])

  const totalAllocated = Object.values(allocation).reduce((sum, points) => sum + points, 0)
  const remainingPoints = totalPoints - totalAllocated

  const updatePoints = (optionId: string, newPoints: number) => {
    // Ensure points are within bounds
    const clampedPoints = Math.max(0, Math.min(newPoints, totalPoints))

    // Check if this would exceed total points
    const otherPoints = Object.entries(allocation)
      .filter(([id]) => id !== optionId)
      .reduce((sum, [, points]) => sum + points, 0)

    const maxAllowedForThisOption = totalPoints - otherPoints
    const finalPoints = Math.min(clampedPoints, maxAllowedForThisOption)

    // Validate constraints
    const newErrors = { ...errors }
    delete newErrors[optionId] // Clear existing error

    if (finalPoints < minPointsPerOption && finalPoints > 0) {
      newErrors[optionId] = `Minimum ${minPointsPerOption} points required`
    } else if (maxPointsPerOption && finalPoints > maxPointsPerOption) {
      newErrors[optionId] = `Maximum ${maxPointsPerOption} points allowed`
    }

    setAllocation((prev) => ({ ...prev, [optionId]: finalPoints }))
    setErrors(newErrors)
  }

  const handleInputChange = (optionId: string, value: string) => {
    const points = Number.parseInt(value) || 0
    updatePoints(optionId, points)
  }

  const incrementPoints = (optionId: string, amount = 1) => {
    const currentPoints = allocation[optionId] || 0
    updatePoints(optionId, currentPoints + amount)
  }

  const decrementPoints = (optionId: string, amount = 1) => {
    const currentPoints = allocation[optionId] || 0
    updatePoints(optionId, Math.max(0, currentPoints - amount))
  }

  const distributeEvenly = () => {
    const pointsPerOption = Math.floor(totalPoints / options.length)
    const remainder = totalPoints % options.length

    const newAllocation: Record<string, number> = {}
    options.forEach((option, index) => {
      newAllocation[option.id] = pointsPerOption + (index < remainder ? 1 : 0)
    })

    setAllocation(newAllocation)
    setErrors({})
  }

  const clearAll = () => {
    const newAllocation: Record<string, number> = {}
    options.forEach((option) => {
      newAllocation[option.id] = 0
    })
    setAllocation(newAllocation)
    setErrors({})
  }

  const canSubmit = () => {
    if (Object.keys(errors).length > 0) return false
    if (totalAllocated === 0) return false // Must allocate at least some points

    // Check if all allocated points meet minimum requirements
    for (const option of options) {
      const points = allocation[option.id] || 0
      if (points > 0 && points < minPointsPerOption) return false
      if (maxPointsPerOption && points > maxPointsPerOption) return false
    }

    return true
  }

  const handleSubmit = () => {
    if (canSubmit()) {
      onSubmit({ allocation })
    }
  }

  const getProgressPercentage = (optionId: string) => {
    const points = allocation[optionId] || 0
    return totalPoints > 0 ? (points / totalPoints) * 100 : 0
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-3">{pollData.question || "Allocate Your Points"}</h3>
        <p className="text-muted-foreground mb-4">
          Distribute {totalPoints} points among the options below based on your preferences.
        </p>
        <div className="flex items-center justify-center gap-4 mb-6">
          <Badge
            variant={remainingPoints === 0 ? "default" : remainingPoints < 0 ? "destructive" : "secondary"}
            className="text-lg px-4 py-2"
          >
            {remainingPoints} points remaining
          </Badge>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {totalAllocated} / {totalPoints} allocated
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        {options.map((option) => {
          const points = allocation[option.id] || 0
          const percentage = getProgressPercentage(option.id)

          return (
            <Card key={option.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium flex-1">{option.text}</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => decrementPoints(option.id, 5)}
                      disabled={disabled || points === 0}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => decrementPoints(option.id, 1)}
                      disabled={disabled || points === 0}
                      className="h-8 w-8 p-0"
                    >
                      -1
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      max={totalPoints}
                      value={points}
                      onChange={(e) => handleInputChange(option.id, e.target.value)}
                      className="w-20 text-center font-semibold"
                      disabled={disabled}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => incrementPoints(option.id, 1)}
                      disabled={disabled || remainingPoints <= 0}
                      className="h-8 w-8 p-0"
                    >
                      +1
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => incrementPoints(option.id, 5)}
                      disabled={disabled || remainingPoints < 5}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    {points} points ({percentage.toFixed(1)}%)
                  </span>
                  {points > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => updatePoints(option.id, 0)}
                      disabled={disabled}
                      className="h-auto p-0 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>

                {errors[option.id] && <p className="text-sm text-red-500">{errors[option.id]}</p>}
              </div>
            </Card>
          )
        })}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={distributeEvenly} disabled={disabled} className="flex-1">
          Distribute Evenly
        </Button>
        <Button type="button" variant="outline" onClick={clearAll} disabled={disabled} className="flex-1">
          Clear All
        </Button>
      </div>

      {totalAllocated !== totalPoints && totalAllocated > 0 && (
        <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            {totalAllocated < totalPoints
              ? `You still have ${remainingPoints} points to allocate`
              : `You've allocated ${Math.abs(remainingPoints)} points too many`}
          </p>
        </div>
      )}

      <Button onClick={handleSubmit} disabled={!canSubmit() || disabled} className="w-full py-3 text-lg" size="lg">
        {disabled ? "Submitting..." : totalAllocated === 0 ? "Allocate points to submit" : "Submit Your Allocation"}
      </Button>
    </div>
  )
}
