"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckSquare } from "lucide-react"
import type { MultipleChoicePoll } from "@/types/poll-types"

interface MultipleChoiceParticipantProps {
  poll: MultipleChoicePoll
  onSubmit: (response: string | string[]) => void
  disabled?: boolean
}

export function MultipleChoiceParticipant({ poll, onSubmit, disabled }: MultipleChoiceParticipantProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [singleSelection, setSingleSelection] = useState<string>("")

  const handleSingleSelectionChange = (value: string) => {
    setSingleSelection(value)
  }

  const handleMultipleSelectionChange = (optionId: string, checked: boolean) => {
    if (checked) {
      setSelectedOptions([...selectedOptions, optionId])
    } else {
      setSelectedOptions(selectedOptions.filter((id) => id !== optionId))
    }
  }

  const handleSubmit = () => {
    if (poll.data.allowMultipleAnswers) {
      onSubmit(selectedOptions)
    } else {
      onSubmit(singleSelection)
    }
  }

  const canSubmit = poll.data.allowMultipleAnswers ? selectedOptions.length > 0 : singleSelection !== ""

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-blue-500" />
          {poll.data.question}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {poll.data.allowMultipleAnswers ? "Select all that apply" : "Select one option"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {poll.data.allowMultipleAnswers ? (
          <div className="space-y-3">
            {poll.data.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <Checkbox
                  id={option.id}
                  checked={selectedOptions.includes(option.id)}
                  onCheckedChange={(checked) => handleMultipleSelectionChange(option.id, checked as boolean)}
                  disabled={disabled}
                />
                <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </div>
        ) : (
          <RadioGroup value={singleSelection} onValueChange={handleSingleSelectionChange} disabled={disabled}>
            {poll.data.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        <Button onClick={handleSubmit} disabled={disabled || !canSubmit} className="w-full">
          Submit Answer
        </Button>
      </CardContent>
    </Card>
  )
}
