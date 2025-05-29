"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
    return rawOptions.map((option: any) => {
      if (typeof option === "string") return { id: option, text: option }
      if (option && typeof option === "object") {
        return {
          id: option.id || option.text || String(Math.random()),
          text: option.text || option.id || "Option",
        }
      }
      return { id: String(Math.random()), text: "Option" }
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

  const handlePointsChange = (optionId: string, value: string) => {
    const points = Number.parseInt(value) || 0
    const newAllocation = { ...allocation, [optionId]: points }

    // Validate constraints
    const newErrors: Record<string, string> = {}

    if (points < minPointsPerOption) {
      newErrors[optionId] = `Minimum ${minPointsPerOption} points required`
    } else if (maxPointsPerOption && points > maxPointsPerOption) {
      newErrors[optionId] = `Maximum ${maxPointsPerOption} points allowed`
    }

    const newTotal = Object.values(newAllocation).reduce((sum, p) => sum + p, 0)
    if (newTotal > totalPoints) {
      newErrors[optionId] = `Would exceed total points (${totalPoints})`
      return // Don't update if it would exceed total
    }

    setAllocation(newAllocation)
    setErrors(newErrors)
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
    if (totalAllocated !== totalPoints) return false

    // Check min/max constraints
    for (const option of options) {
      const points = allocation[option.id] || 0
      if (points < minPointsPerOption) return false
      if (maxPointsPerOption && points > maxPointsPerOption) return false
    }

    return true
  }

  const handleSubmit = () => {
    if (canSubmit()) {
      onSubmit({ allocation })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">{pollData.question || "Allocate Points"}</h3>
        <div className="flex items-center gap-4 mb-4">
          <Badge variant={remainingPoints === 0 ? "default" : "secondary"}>{remainingPoints} points remaining</Badge>
          <Badge variant="outline">
            {totalAllocated} / {totalPoints} allocated
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        {options.map((option) => (
          <Card key={option.id} className="p-4">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor={`points-${option.id}`} className="flex-1 text-sm font-medium">
                {option.text}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id={`points-${option.id}`}
                  type="number"
                  min={minPointsPerOption}
                  max={maxPointsPerOption || totalPoints}
                  value={allocation[option.id] || 0}
                  onChange={(e) => handlePointsChange(option.id, e.target.value)}
                  className="w-20 text-center"
                  disabled={disabled}
                />
                <span className="text-sm text-muted-foreground">pts</span>
              </div>
            </div>
            {errors[option.id] && <p className="text-sm text-red-500 mt-1">{errors[option.id]}</p>}
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={distributeEvenly} disabled={disabled} className="flex-1">
          Distribute Evenly
        </Button>
        <Button variant="outline" onClick={clearAll} disabled={disabled} className="flex-1">
          Clear All
        </Button>
      </div>

      {totalAllocated !== totalPoints && (
        <div className="text-center text-sm text-muted-foreground">
          {totalAllocated < totalPoints
            ? `Allocate ${remainingPoints} more points to submit`
            : `Remove ${Math.abs(remainingPoints)} points to submit`}
        </div>
      )}

      <Button onClick={handleSubmit} disabled={!canSubmit() || disabled} className="w-full">
        {disabled ? "Submitting..." : "Submit"}
      </Button>
    </div>
  )
}
