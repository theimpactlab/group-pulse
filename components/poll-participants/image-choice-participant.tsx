"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ImageIcon, Check } from "lucide-react"
import type { ImageChoicePoll } from "@/types/poll-types"

interface ImageChoiceParticipantProps {
  poll: ImageChoicePoll
  onSubmit: (response: { selectedOptionId: string }) => void
  onChange?: (response: { selectedOptionId: string }) => void
  disabled?: boolean
}

export function ImageChoiceParticipant({ poll, onSubmit, onChange, disabled }: ImageChoiceParticipantProps) {
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const handleSelect = (optionId: string) => {
    if (hasSubmitted || disabled) return
    setSelectedOption(optionId)
    // Report selection to parent immediately so "Submit All" can capture it
    const response = { selectedOptionId: optionId }
    if (onChange) onChange(response)
    else onSubmit(response)
  }

  const handleSubmit = () => {
    if (!selectedOption) return
    setHasSubmitted(true)
    onSubmit({ selectedOptionId: selectedOption })
  }

  const handleImageError = (optionId: string) => {
    setImageErrors((prev) => ({ ...prev, [optionId]: true }))
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-pink-500" />
          {poll.data.question}
        </CardTitle>
        <p className="text-sm text-muted-foreground">Select an image to submit your choice</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`grid gap-4 ${
            poll.data.options.length === 2
              ? "grid-cols-2"
              : poll.data.options.length === 3
                ? "grid-cols-3"
                : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          }`}
        >
          {poll.data.options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              disabled={disabled || hasSubmitted}
              className={`relative rounded-lg border-2 overflow-hidden transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary ${
                selectedOption === option.id
                  ? "border-primary ring-2 ring-primary/20 scale-[1.02]"
                  : "border-transparent hover:border-muted-foreground/30"
              } ${hasSubmitted && selectedOption !== option.id ? "opacity-50" : ""}`}
            >
              {selectedOption === option.id && (
                <div className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}
              <div className="aspect-square relative bg-muted">
                {option.imageUrl && !imageErrors[option.id] ? (
                  <img
                    src={option.imageUrl}
                    alt={option.caption || "Image option"}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(option.id)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              {option.caption && (
                <div className="p-2 text-center">
                  <p className="text-sm font-medium truncate">{option.caption}</p>
                </div>
              )}
            </button>
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={disabled || hasSubmitted || !selectedOption}
          className="w-full"
        >
          {hasSubmitted ? "Choice Submitted" : "Submit Choice"}
        </Button>
      </CardContent>
    </Card>
  )
}
