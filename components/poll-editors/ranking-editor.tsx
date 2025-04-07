"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, GripVertical } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import type { RankingPoll } from "@/types/poll-types"

interface RankingEditorProps {
  poll: RankingPoll
  onChange: (poll: RankingPoll) => void
}

export function RankingEditor({ poll, onChange }: RankingEditorProps) {
  const handleQuestionChange = (question: string) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        question,
      },
    })
  }

  const handleOptionChange = (id: string, text: string) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        options: poll.data.options.map((option) => (option.id === id ? { ...option, text } : option)),
      },
    })
  }

  const handleAddOption = () => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        options: [...poll.data.options, { id: uuidv4(), text: "" }],
      },
    })
  }

  const handleRemoveOption = (id: string) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        options: poll.data.options.filter((option) => option.id !== id),
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
        <Label>Items to rank</Label>
        <div className="space-y-2 mt-1">
          {poll.data.options.map((option, index) => (
            <div key={option.id} className="flex items-center gap-2">
              <div className="p-2 text-muted-foreground">
                <GripVertical className="h-4 w-4" />
              </div>
              <Input
                value={option.text}
                onChange={(e) => handleOptionChange(option.id, e.target.value)}
                placeholder={`Item ${index + 1}`}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveOption(option.id)}
                disabled={poll.data.options.length <= 2}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleAddOption} className="mt-2">
          <Plus className="h-4 w-4 mr-2" /> Add Item
        </Button>
      </div>
    </div>
  )
}

