"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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

  const handleSubmit = () => {
    if (response.trim()) {
      onSubmit(response.trim())
    }
  }

  const remainingChars = poll.data.maxResponseLength ? poll.data.maxResponseLength - response.length : null

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-green-500" />
          {poll.data.question}
        </CardTitle>
        <p className="text-sm text-muted-foreground">Share your thoughts in detail</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Type your response here..."
          disabled={disabled}
          className="min-h-[120px]"
          maxLength={poll.data.maxResponseLength}
        />

        {remainingChars !== null && (
          <p className="text-xs text-muted-foreground text-right">{remainingChars} characters remaining</p>
        )}

        <Button onClick={handleSubmit} disabled={disabled || !response.trim()} className="w-full">
          Submit Response
        </Button>
      </CardContent>
    </Card>
  )
}
