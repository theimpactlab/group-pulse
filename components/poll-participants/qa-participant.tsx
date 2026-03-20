"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, ThumbsUp, Send } from "lucide-react"
import type { QAPoll } from "@/types/poll-types"

interface QAParticipantProps {
  poll: QAPoll
  onSubmit: (response: { question: string; anonymous: boolean }) => void
  disabled?: boolean
}

export function QAParticipant({ poll, onSubmit, disabled }: QAParticipantProps) {
  const [question, setQuestion] = useState("")
  const [submittedQuestions, setSubmittedQuestions] = useState<
    { text: string; anonymous: boolean; votes: number }[]
  >([])
  const [isAnonymous, setIsAnonymous] = useState(false)

  const handleSubmitQuestion = () => {
    if (!question.trim()) return
    const newQuestion = { text: question.trim(), anonymous: isAnonymous, votes: 0 }
    setSubmittedQuestions((prev) => [newQuestion, ...prev])
    onSubmit({ question: question.trim(), anonymous: isAnonymous })
    setQuestion("")
  }

  const handleUpvote = (index: number) => {
    if (!poll.data.allowUpvoting) return
    setSubmittedQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, votes: q.votes + 1 } : q))
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmitQuestion()
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-green-500" />
          {poll.data.title}
        </CardTitle>
        {poll.data.description && (
          <p className="text-sm text-muted-foreground">{poll.data.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question..."
              disabled={disabled}
              className="flex-1"
            />
            <Button
              onClick={handleSubmitQuestion}
              disabled={disabled || !question.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {poll.data.allowAnonymous && (
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded"
              />
              Submit anonymously
            </label>
          )}
        </div>

        {submittedQuestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Your questions ({submittedQuestions.length})
            </h4>
            {submittedQuestions.map((q, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg border p-3 bg-muted/30"
              >
                <div className="flex-1">
                  <p className="text-sm">{q.text}</p>
                  {q.anonymous && (
                    <span className="text-xs text-muted-foreground italic">Anonymous</span>
                  )}
                </div>
                {poll.data.allowUpvoting && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 h-8"
                    onClick={() => handleUpvote(index)}
                  >
                    <ThumbsUp className="h-3 w-3" />
                    <span className="text-xs">{q.votes}</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {submittedQuestions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No questions submitted yet. Be the first to ask!
          </p>
        )}
      </CardContent>
    </Card>
  )
}
