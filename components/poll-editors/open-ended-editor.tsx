"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import type { OpenEndedPoll } from "@/types/poll-types"

interface OpenEndedEditorProps {
  poll: OpenEndedPoll
  onChange: (poll: OpenEndedPoll) => void
}

export function OpenEndedEditor({ poll, onChange }: OpenEndedEditorProps) {
  const handleQuestionChange = (question: string) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        question,
      },
    })
  }

  const handleMaxLengthChange = (value: number[]) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        maxResponseLength: value[0],
      },
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="question">Question</Label>
        <Input
          id="question"
          value={poll.data.question}
          onChange={(e) => handleQuestionChange(e.target.value)}
          placeholder="Enter your question"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="maxLength">Maximum response length: {poll.data.maxResponseLength || "Unlimited"}</Label>
        <Slider
          id="maxLength"
          min={0}
          max={500}
          step={10}
          value={[poll.data.maxResponseLength || 0]}
          onValueChange={handleMaxLengthChange}
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-1">Set to 0 for unlimited length</p>
      </div>
    </div>
  )
}

