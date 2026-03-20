"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { HelpCircle, CheckCircle2, XCircle } from "lucide-react"
import type { QuizPoll } from "@/types/poll-types"

interface QuizParticipantProps {
  poll: QuizPoll
  onSubmit: (response: { selectedOptionId: string; isCorrect: boolean }) => void
  onChange?: (response: { selectedOptionId: string; isCorrect: boolean }) => void
  disabled?: boolean
}

export function QuizParticipant({ poll, onSubmit, onChange, disabled }: QuizParticipantProps) {
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const handleOptionSelect = (value: string) => {
    if (hasSubmitted) return
    setSelectedOption(value)
    // Report selection to parent immediately so "Submit All" can capture it
    const selected = poll.data.options.find((opt) => opt.id === value)
    const isCorrect = selected?.isCorrect || false
    const response = { selectedOptionId: value, isCorrect }
    if (onChange) onChange(response)
    else onSubmit(response)
  }

  const handleSubmit = () => {
    if (!selectedOption) return

    const selected = poll.data.options.find((opt) => opt.id === selectedOption)
    const isCorrect = selected?.isCorrect || false

    setHasSubmitted(true)
    onSubmit({ selectedOptionId: selectedOption, isCorrect })
  }

  const getOptionStyle = (optionId: string, isCorrect: boolean) => {
    if (!hasSubmitted || !poll.data.showCorrectAnswer) return ""
    if (isCorrect) return "border-green-500 bg-green-50"
    if (optionId === selectedOption && !isCorrect) return "border-red-500 bg-red-50"
    return ""
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-amber-500" />
          {poll.data.question}
        </CardTitle>
        <p className="text-sm text-muted-foreground">Select the correct answer</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={selectedOption}
          onValueChange={handleOptionSelect}
          disabled={disabled || hasSubmitted}
        >
          {poll.data.options.map((option) => (
            <div
              key={option.id}
              className={`flex items-center space-x-3 rounded-lg border p-4 transition-colors ${getOptionStyle(option.id, option.isCorrect)} ${
                !hasSubmitted && selectedOption === option.id ? "border-primary bg-primary/5" : ""
              }`}
            >
              <RadioGroupItem value={option.id} id={`quiz-${poll.id}-${option.id}`} />
              <Label
                htmlFor={`quiz-${poll.id}-${option.id}`}
                className="flex-1 cursor-pointer font-normal"
              >
                {option.text}
              </Label>
              {hasSubmitted && poll.data.showCorrectAnswer && (
                <>
                  {option.isCorrect && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  {option.id === selectedOption && !option.isCorrect && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </>
              )}
            </div>
          ))}
        </RadioGroup>

        {hasSubmitted && poll.data.showCorrectAnswer && (
          <div
            className={`rounded-lg p-3 text-sm font-medium ${
              poll.data.options.find((o) => o.id === selectedOption)?.isCorrect
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {poll.data.options.find((o) => o.id === selectedOption)?.isCorrect
              ? "Correct! Well done!"
              : "Incorrect. The correct answer has been highlighted."}
          </div>
        )}

        {!hasSubmitted && (
          <Button
            onClick={handleSubmit}
            disabled={disabled || !selectedOption}
            className="w-full"
          >
            Submit Answer
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
