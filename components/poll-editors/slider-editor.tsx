"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import type { SliderPoll } from "@/types/poll-types"

interface SliderEditorProps {
  poll: SliderPoll
  onChange: (poll: SliderPoll) => void
}

export function SliderEditor({ poll, onChange }: SliderEditorProps) {
  const handleQuestionChange = (question: string) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        question,
      },
    })
  }

  const handleLeftOptionChange = (leftOption: string) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        leftOption,
      },
    })
  }

  const handleRightOptionChange = (rightOption: string) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        rightOption,
      },
    })
  }

  const handleStepsChange = (value: number[]) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        steps: value[0],
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="leftOption">Left Option</Label>
          <Input
            id="leftOption"
            value={poll.data.leftOption}
            onChange={(e) => handleLeftOptionChange(e.target.value)}
            placeholder="e.g., Strongly Disagree"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="rightOption">Right Option</Label>
          <Input
            id="rightOption"
            value={poll.data.rightOption}
            onChange={(e) => handleRightOptionChange(e.target.value)}
            placeholder="e.g., Strongly Agree"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="steps">Number of positions: {poll.data.steps}</Label>
        <Slider
          id="steps"
          min={3}
          max={11}
          step={2}
          value={[poll.data.steps]}
          onValueChange={handleStepsChange}
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Choose an odd number of positions to allow for a neutral middle option
        </p>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg mt-4">
        <div className="flex justify-between mb-4 text-sm">
          <span>{poll.data.leftOption}</span>
          <span>{poll.data.rightOption}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full relative">
          <div className="absolute h-2 bg-primary rounded-full" style={{ width: "50%" }} />
        </div>
        <div className="flex justify-between mt-4">
          <span className="text-xs text-muted-foreground">0%</span>
          <span className="text-xs text-muted-foreground">50%</span>
          <span className="text-xs text-muted-foreground">100%</span>
        </div>
      </div>
    </div>
  )
}
