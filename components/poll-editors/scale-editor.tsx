"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ScalePoll } from "@/types/poll-types"

interface ScaleEditorProps {
  poll: ScalePoll
  onChange: (poll: ScalePoll) => void
}

export function ScaleEditor({ poll, onChange }: ScaleEditorProps) {
  const handleQuestionChange = (question: string) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        question,
      },
    })
  }

  const handleMinChange = (min: number) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        min: min,
      },
    })
  }

  const handleMaxChange = (max: number) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        max: max,
      },
    })
  }

  const handleStepChange = (step: number) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        step: step,
      },
    })
  }

  const handleMinLabelChange = (minLabel: string) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        minLabel,
      },
    })
  }

  const handleMaxLabelChange = (maxLabel: string) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        maxLabel,
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

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="min">Minimum value</Label>
          <Input
            id="min"
            type="number"
            value={poll.data.min}
            onChange={(e) => handleMinChange(Number.parseInt(e.target.value))}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="max">Maximum value</Label>
          <Input
            id="max"
            type="number"
            value={poll.data.max}
            onChange={(e) => handleMaxChange(Number.parseInt(e.target.value))}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="step">Step</Label>
          <Input
            id="step"
            type="number"
            value={poll.data.step}
            onChange={(e) => handleStepChange(Number.parseFloat(e.target.value))}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minLabel">Minimum label (optional)</Label>
          <Input
            id="minLabel"
            value={poll.data.minLabel || ""}
            onChange={(e) => handleMinLabelChange(e.target.value)}
            placeholder="e.g., Not at all"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="maxLabel">Maximum label (optional)</Label>
          <Input
            id="maxLabel"
            value={poll.data.maxLabel || ""}
            onChange={(e) => handleMaxLabelChange(e.target.value)}
            placeholder="e.g., Very much"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  )
}

