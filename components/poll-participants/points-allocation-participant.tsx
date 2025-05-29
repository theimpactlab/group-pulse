"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

interface PointsAllocationParticipantProps {
  poll: any
  onSubmit: (data: any) => void
  disabled: boolean
}

export function PointsAllocationParticipant({ poll, onSubmit, disabled }: PointsAllocationParticipantProps) {
  console.log("PointsAllocationParticipant rendering with poll:", poll)

  // Extract poll data safely
  const question = poll?.data?.question || "Allocate points"
  const rawOptions = poll?.data?.options || []
  const totalPoints = poll?.data?.totalPoints || 100

  // Memoize options to prevent infinite re-renders
  const options = useMemo(() => {
    return rawOptions.map((opt: any, index: number) => {
      if (typeof opt === "string") {
        return { id: String(index), text: opt }
      }
      return {
        id: String(index),
        text: opt?.text || opt?.id || `Option ${index + 1}`,
      }
    })
  }, [rawOptions])

  console.log("Processed options:", options)

  // Simple state for points
  const [points, setPoints] = useState<Record<string, number>>({})

  // Initialize points only when options change
  useEffect(() => {
    console.log("useEffect triggered, options length:", options.length)
    const initial: Record<string, number> = {}
    options.forEach((opt) => {
      initial[opt.id] = 0
    })
    setPoints(initial)
    console.log("Initialized points:", initial)
  }, [options.length]) // Only depend on length to avoid infinite loop

  // Calculate total allocated
  const totalAllocated = Object.values(points).reduce((sum, val) => sum + val, 0)
  const remaining = totalPoints - totalAllocated

  // Handle input change
  const handleChange = (id: string, value: string) => {
    console.log("Input change:", id, value)
    try {
      const numValue = Math.max(0, Number.parseInt(value) || 0)
      setPoints((prev) => ({
        ...prev,
        [id]: numValue,
      }))
      console.log("Updated points for", id, "to", numValue)
    } catch (err) {
      console.error("Error updating points:", err)
    }
  }

  // Handle submission
  const handleSubmit = () => {
    console.log("Submitting points:", points)
    onSubmit({ allocation: points })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">{question}</h2>
        <p className="mb-4">
          You have {totalPoints} points to distribute. Currently allocated: {totalAllocated}, Remaining: {remaining}
        </p>
      </div>

      <div className="space-y-4">
        {options.map((option) => (
          <Card key={option.id} className="p-4">
            <div className="flex items-center justify-between">
              <Label htmlFor={`input-${option.id}`}>{option.text}</Label>
              <Input
                id={`input-${option.id}`}
                type="number"
                min="0"
                max={totalPoints}
                value={points[option.id] || 0}
                onChange={(e) => handleChange(option.id, e.target.value)}
                className="w-24 text-right"
                placeholder="0"
              />
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <p className="mb-4">
          Total allocated: {totalAllocated} / {totalPoints}
        </p>
        <Button onClick={handleSubmit} disabled={disabled || totalAllocated === 0} className="w-full">
          {disabled ? "Submitting..." : "Submit Allocation"}
        </Button>
      </div>
    </div>
  )
}
