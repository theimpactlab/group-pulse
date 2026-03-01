"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"
import type { OpenEndedPoll } from "@/types/poll-types"

interface OpenEndedParticipantProps {
  poll: OpenEndedPoll
  onSubmit: (response: string) => void
  disabled?: boolean
}

export function OpenEndedParticipant({ poll, onSubmit, disabled }: OpenEndedParticipantProps) {
  const [response, setResponse] = useState("")
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const remainingChars = poll.data.maxResponseLength ? poll.data.maxResponseLength - response.length : null

  const handleSubmit = () => {
    if (!response.trim()) return
    setHasSubmitted(true)
    onSubmit(response.trim())
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-green-500" />
          {poll.data.question}
        </CardTitle>
        <p className="text-sm text-muted-foreground">Share your thoughts below</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Type your response here..."
          disabled={disabled || hasSubmitted}
          className="min-h-[120px]"
          maxLength={poll.data.maxResponseLength}
        />

        {remainingChars !== null && (
          <p className="text-xs text-muted-foreground text-right">{remainingChars} characters remaining</p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={disabled || hasSubmitted || !response.trim()}
          className="w-full"
        >
          {hasSubmitted ? "Submitted" : "Submit Response"}
        </Button>
      </CardContent>
    </Card>
  )
}
