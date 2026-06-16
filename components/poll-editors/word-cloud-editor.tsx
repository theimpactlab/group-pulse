"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import type { WordCloudPoll } from "@/types/poll-types"

interface WordCloudEditorProps {
  poll: WordCloudPoll
  onChange: (poll: WordCloudPoll) => void
}

export function WordCloudEditor({ poll, onChange }: WordCloudEditorProps) {
  const maxCharacters = poll.data.maxCharacters ?? 50
  const allowMultipleSubmissions = poll.data.allowMultipleSubmissions ?? true
  const requireUniqueResponses = poll.data.requireUniqueResponses ?? true

  const updateData = (updates: Partial<WordCloudPoll["data"]>) => {
    onChange({ ...poll, data: { ...poll.data, ...updates } })
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="question">Question</Label>
        <Input
          id="question"
          value={poll.data.question}
          onChange={(e) => updateData({ question: e.target.value })}
          placeholder="Enter your question"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="maxEntries">Maximum responses per participant: {poll.data.maxEntries}</Label>
        <Slider
          id="maxEntries"
          min={1}
          max={25}
          step={1}
          value={[poll.data.maxEntries]}
          onValueChange={(value) => updateData({ maxEntries: value[0] })}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="maxCharacters">Maximum characters per response: {maxCharacters}</Label>
        <Slider
          id="maxCharacters"
          min={10}
          max={200}
          step={5}
          value={[maxCharacters]}
          onValueChange={(value) => updateData({ maxCharacters: value[0] })}
          className="mt-2"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="allowMultipleSubmissions"
            checked={allowMultipleSubmissions}
            onCheckedChange={(checked) => updateData({ allowMultipleSubmissions: Boolean(checked) })}
          />
          <Label htmlFor="allowMultipleSubmissions">Allow multiple responses</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="requireUniqueResponses"
            checked={requireUniqueResponses}
            onCheckedChange={(checked) => updateData({ requireUniqueResponses: Boolean(checked) })}
          />
          <Label htmlFor="requireUniqueResponses">Require unique responses</Label>
        </div>
      </div>
    </div>
  )
}
