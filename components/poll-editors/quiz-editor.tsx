"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Plus, GripVertical } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import type { QuizPoll } from "@/types/poll-types"

interface QuizEditorProps {
  poll: QuizPoll
  onChange: (poll: QuizPoll) => void
}

export function QuizEditor({ poll, onChange }: QuizEditorProps) {
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

  const handleCorrectAnswerChange = (id: string, isCorrect: boolean) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        options: poll.data.options.map((option) => (option.id === id ? { ...option, isCorrect } : option)),
      },
    })
  }

  const handleAddOption = () => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        options: [...poll.data.options, { id: uuidv4(), text: "", isCorrect: false }],
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

  const handleShowCorrectAnswerChange = (checked: boolean) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        showCorrectAnswer: checked,
      },
    })
  }

  const handlePointsChange = (points: number) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        pointsPerQuestion: points,
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
        <Label>Options</Label>
        <div className="space-y-2 mt-1">
          {poll.data.options.map((option, index) => (
            <div key={option.id} className="flex items-center gap-2">
              <div className="p-2 text-muted-foreground">
                <GripVertical className="h-4 w-4" />
              </div>
              <Input
                value={option.text}
                onChange={(e) => handleOptionChange(option.id, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1"
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`correct-${option.id}`}
                  checked={option.isCorrect}
                  onCheckedChange={(checked) => handleCorrectAnswerChange(option.id, !!checked)}
                />
                <Label htmlFor={`correct-${option.id}`} className="text-sm">
                  Correct
                </Label>
              </div>
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
          <Plus className="h-4 w-4 mr-2" /> Add Option
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="showCorrectAnswer"
            checked={poll.data.showCorrectAnswer}
            onCheckedChange={handleShowCorrectAnswerChange}
          />
          <Label htmlFor="showCorrectAnswer">Show correct answer after submission</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="points">Points per question</Label>
        <Input
          id="points"
          type="number"
          value={poll.data.pointsPerQuestion || 1}
          onChange={(e) => handlePointsChange(Number.parseInt(e.target.value))}
          className="mt-1 w-32"
          min={1}
        />
      </div>
    </div>
  )
}

