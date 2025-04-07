"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import type { QAPoll } from "@/types/poll-types"

interface QAEditorProps {
  poll: QAPoll
  onChange: (poll: QAPoll) => void
}

export function QAEditor({ poll, onChange }: QAEditorProps) {
  const handleTitleChange = (title: string) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        title,
      },
    })
  }

  const handleDescriptionChange = (description: string) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        description,
      },
    })
  }

  const handleAllowAnonymousChange = (checked: boolean) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        allowAnonymous: checked,
      },
    })
  }

  const handleAllowUpvotingChange = (checked: boolean) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        allowUpvoting: checked,
      },
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={poll.data.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Enter a title for your Q&A"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={poll.data.description || ""}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="Enter a description for your Q&A"
          className="mt-1"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="allowAnonymous"
            checked={poll.data.allowAnonymous}
            onCheckedChange={handleAllowAnonymousChange}
          />
          <Label htmlFor="allowAnonymous">Allow anonymous questions</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="allowUpvoting" checked={poll.data.allowUpvoting} onCheckedChange={handleAllowUpvotingChange} />
          <Label htmlFor="allowUpvoting">Allow upvoting questions</Label>
        </div>
      </div>
    </div>
  )
}

