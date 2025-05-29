"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Coins } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import type { PointsAllocationPoll } from "@/types/poll-types"

interface PointsAllocationEditorProps {
  poll: PointsAllocationPoll
  onChange: (poll: PointsAllocationPoll) => void
}

export function PointsAllocationEditor({ poll, onChange }: PointsAllocationEditorProps) {
  const updateQuestion = (question: string) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        question,
      },
    })
  }

  const updateTotalPoints = (totalPoints: number) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        totalPoints,
      },
    })
  }

  const updateMinPoints = (minPointsPerOption: number) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        minPointsPerOption,
      },
    })
  }

  const updateMaxPoints = (maxPointsPerOption: number) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        maxPointsPerOption,
      },
    })
  }

  const addOption = () => {
    const newOption = {
      id: uuidv4(),
      text: `Option ${poll.data.options.length + 1}`,
    }

    onChange({
      ...poll,
      data: {
        ...poll.data,
        options: [...poll.data.options, newOption],
      },
    })
  }

  const updateOption = (optionId: string, text: string) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        options: poll.data.options.map((option) => (option.id === optionId ? { ...option, text } : option)),
      },
    })
  }

  const removeOption = (optionId: string) => {
    if (poll.data.options.length <= 2) return // Keep at least 2 options

    onChange({
      ...poll,
      data: {
        ...poll.data,
        options: poll.data.options.filter((option) => option.id !== optionId),
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Question Input */}
      <div className="space-y-2">
        <Label htmlFor="question">Question</Label>
        <Textarea
          id="question"
          placeholder="How would you allocate 100 points among these options?"
          value={poll.data.question}
          onChange={(e) => updateQuestion(e.target.value)}
          className="min-h-[80px]"
        />
      </div>

      {/* Points Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="totalPoints">Total Points</Label>
          <Input
            id="totalPoints"
            type="number"
            min="1"
            max="1000"
            value={poll.data.totalPoints}
            onChange={(e) => updateTotalPoints(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minPoints">Min Points per Option (Optional)</Label>
          <Input
            id="minPoints"
            type="number"
            min="0"
            max={poll.data.totalPoints}
            value={poll.data.minPointsPerOption || 0}
            onChange={(e) => updateMinPoints(Number(e.target.value))}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxPoints">Max Points per Option (Optional)</Label>
          <Input
            id="maxPoints"
            type="number"
            min="0"
            max={poll.data.totalPoints}
            value={poll.data.maxPointsPerOption || poll.data.totalPoints}
            onChange={(e) => updateMaxPoints(Number(e.target.value))}
            placeholder={poll.data.totalPoints.toString()}
          />
        </div>
      </div>

      {/* Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Options</Label>
          <Button onClick={addOption} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Option
          </Button>
        </div>

        <div className="space-y-3">
          {poll.data.options.map((option, index) => (
            <div key={option.id} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">{index + 1}</span>
              </div>
              <Input
                value={option.text}
                onChange={(e) => updateOption(option.id, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeOption(option.id)}
                disabled={poll.data.options.length <= 2}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-500" />
            Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="font-medium">{poll.data.question}</h3>
            <div className="text-sm text-muted-foreground">
              Distribute {poll.data.totalPoints} points among the options below:
            </div>
            <div className="space-y-3">
              {poll.data.options.map((option, index) => (
                <div key={option.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{option.text}</span>
                  <div className="ml-auto flex items-center gap-2">
                    <Input
                      type="number"
                      min={poll.data.minPointsPerOption || 0}
                      max={poll.data.maxPointsPerOption || poll.data.totalPoints}
                      placeholder="0"
                      className="w-20 text-center"
                      disabled
                    />
                    <span className="text-sm text-muted-foreground">pts</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground text-center">Points remaining: {poll.data.totalPoints}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
