"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { SlidersHorizontal } from "lucide-react"
import type { SliderPoll } from "@/types/poll-types"

interface SliderParticipantProps {
  poll: SliderPoll
  onSubmit: (response: { value: number }) => void
  disabled?: boolean
}

export function SliderParticipant({ poll, onSubmit, disabled }: SliderParticipantProps) {
  const middleValue = Math.floor((poll.data.steps || 10) / 2)
  const [value, setValue] = useState<number>(middleValue)

  const handleSubmit = () => {
    onSubmit({ value })
  }

  // Calculate percentage for visual feedback
  const percentage = ((value / (poll.data.steps || 10)) * 100).toFixed(0)

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-indigo-500" />
          {poll.data.question}
        </CardTitle>
        <p className="text-sm text-muted-foreground">Move the slider to indicate your preference</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {/* Option labels */}
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-left max-w-[45%]">{poll.data.leftOption}</span>
            <span className="text-right max-w-[45%]">{poll.data.rightOption}</span>
          </div>

          {/* Slider */}
          <div className="px-2">
            <Slider
              value={[value]}
              onValueChange={(newValue) => setValue(newValue[0])}
              min={0}
              max={poll.data.steps || 10}
              step={1}
              disabled={disabled}
              className="w-full"
            />
          </div>

          {/* Value indicator */}
          <div className="text-center space-y-1">
            <div className="text-3xl font-bold text-primary">{value}</div>
            <div className="text-sm text-muted-foreground">
              {percentage}% towards {poll.data.rightOption}
            </div>
          </div>

          {/* Visual scale markers */}
          <div className="flex justify-between text-xs text-muted-foreground px-2">
            {Array.from({ length: Math.min(poll.data.steps + 1, 11) }, (_, i) => (
              <span key={i} className="w-1 text-center">
                {i}
              </span>
            ))}
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={disabled} className="w-full">
          Submit Response
        </Button>
      </CardContent>
    </Card>
  )
}
