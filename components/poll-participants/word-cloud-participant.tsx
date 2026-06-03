"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { WordCloudPoll } from "@/types/poll-types"

interface WordCloudParticipantProps {
  poll: WordCloudPoll
  value?: { responses?: string[]; word?: string }
  onChange: (response: { responses: string[] }) => void
  disabled?: boolean
}

export function WordCloudParticipant({
  poll,
  value,
  onChange,
  disabled = false,
}: WordCloudParticipantProps) {
  const [draftResponse, setDraftResponse] = useState("")

  const pollData = poll.data || {}
  const maxEntries = pollData.allowMultipleSubmissions === false ? 1 : pollData.maxEntries || 3
  const maxCharacters = pollData.maxCharacters || 50
  const requireUniqueResponses = pollData.requireUniqueResponses !== false

  const responses = Array.isArray(value?.responses) ? value.responses : value?.word ? [value.word] : []
  const remainingResponses = Math.max(maxEntries - responses.length, 0)
  const trimmedDraft = draftResponse.trim()
  const duplicateResponse = responses.some((response) => response.toLowerCase() === trimmedDraft.toLowerCase())

  const canAddResponse =
    trimmedDraft.length > 0 &&
    trimmedDraft.length <= maxCharacters &&
    remainingResponses > 0 &&
    (!requireUniqueResponses || !duplicateResponse)

  const addResponse = () => {
    if (!canAddResponse || disabled) return
    onChange({ responses: [...responses, trimmedDraft] })
    setDraftResponse("")
  }

  const removeResponse = (indexToRemove: number) => {
    onChange({ responses: responses.filter((_, index) => index !== indexToRemove) })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{pollData.question || "Word Cloud"}</h3>

      <div className="space-y-2">
        <Label htmlFor={`word-input-${poll.id}`}>Enter a word or phrase</Label>

        <div className="flex gap-2">
          <Input
            id={`word-input-${poll.id}`}
            value={draftResponse}
            onChange={(event) => setDraftResponse(event.target.value.slice(0, maxCharacters))}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                addResponse()
              }
            }}
            placeholder="Type your response..."
            maxLength={maxCharacters}
            disabled={disabled || remainingResponses === 0}
          />

          <Button type="button" onClick={addResponse} disabled={disabled || !canAddResponse}>
            Add
          </Button>
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {remainingResponses} response{remainingResponses !== 1 ? "s" : ""} remaining
          </span>
          <span>
            {draftResponse.length}/{maxCharacters} characters
          </span>
        </div>

        {requireUniqueResponses && duplicateResponse && trimmedDraft.length > 0 && (
          <p className="text-xs text-red-600">You have already added this response.</p>
        )}
      </div>

      {responses.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Your responses</p>

          <div className="flex flex-wrap gap-2">
            {responses.map((response, index) => (
              <span
                key={`${response}-${index}`}
                className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
              >
                {response}
                <button
                  type="button"
                  onClick={() => removeResponse(index)}
                  className="text-primary/70 hover:text-primary"
                  disabled={disabled}
                  aria-label={`Remove ${response}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
