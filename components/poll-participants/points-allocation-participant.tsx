"use client"

import { useState, useEffect } from "react"
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

  // Convert options to a simple format
  const options = rawOptions.map((opt: any, index: number) => {
    if (typeof opt === "string") {
      return { id: String(index), text: opt }
    }
    return {
      id: String(index),
      text: opt?.text || opt?.id || `Option ${index + 1}`,
    }
  })

  console.log("Processed options:", options)

  // Simple state for points
  const [points, setPoints] = useState<Record<string, number>>({})

  // Initialize points
  useEffect(() => {
    const initial: Record<string, number> = {}
    options.forEach((opt) => {
      initial[opt.id] = 0
    })
    setPoints(initial)
    console.log("Initialized points:", initial)
  }, [options])

  // Calculate total allocated
  const totalAllocated = Object.values(points).reduce((sum, val) => sum + val, 0)
  const remaining = totalPoints - totalAllocated

  // Handle input change
  const handleChange = (id: string, value: string) => {
    console.log("Input change:", id, value)
    try {
      const numValue = Number.parseInt(value) || 0
      const newPoints = { ...points, [id]: numValue }
      setPoints(newPoints)
      console.log("Updated points:", newPoints)
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
              />
            </div>
          </Card>
        ))}
      </div>

      <Button onClick={handleSubmit} disabled={disabled || totalAllocated === 0} className="w-full">
        Submit
      </Button>
    </div>
  )
}
