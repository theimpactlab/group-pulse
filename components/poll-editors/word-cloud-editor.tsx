"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import type { WordCloudPoll } from "@/types/poll-types"

interface WordCloudEditorProps {
  poll: WordCloudPoll
  onChange: (poll: WordCloudPoll) => void
}

export function WordCloudEditor({ poll, onChange }: WordCloudEditorProps) {
  const handleQuestionChange = (question: string) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        question,
      },
    })
  }

  const handleMaxEntriesChange = (value: number[]) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        maxEntries: value[0],
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
        <Label htmlFor="maxEntries">Maximum entries per participant: {poll.data.maxEntries}</Label>
        <Slider
          id="maxEntries"
          min={1}
          max={10}
          step={1}
          value={[poll.data.maxEntries]}
          onValueChange={handleMaxEntriesChange}
          className="mt-2"
        />
      </div>
    </div>
  )
}

