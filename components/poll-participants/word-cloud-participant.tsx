"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CloudRain } from "lucide-react"
import type { WordCloudPoll } from "@/types/poll-types"

interface WordCloudParticipantProps {
  poll: WordCloudPoll
  onSubmit: (response: string) => void
  disabled?: boolean
}

export function WordCloudParticipant({ poll, onSubmit, disabled }: WordCloudParticipantProps) {
  const [word, setWord] = useState("")

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && word.trim()) {
      onSubmit(word.trim())
      setWord("") // Clear after submission
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudRain className="h-5 w-5 text-purple-500" />
          {poll.data.question}
        </CardTitle>
        <p className="text-sm text-muted-foreground">Enter a word or short phrase (press Enter to add)</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your word here and press Enter..."
          disabled={disabled}
          className="text-lg"
        />
      </CardContent>
    </Card>
  )
}
