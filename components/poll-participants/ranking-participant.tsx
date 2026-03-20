"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ListOrdered, GripVertical, ArrowUp, ArrowDown } from "lucide-react"
import type { RankingPoll } from "@/types/poll-types"

interface RankingParticipantProps {
  poll: RankingPoll
  onSubmit: (response: { ranking: string[] }) => void
  onChange?: (response: { ranking: string[] }) => void
  disabled?: boolean
}

export function RankingParticipant({ poll, onSubmit, onChange, disabled }: RankingParticipantProps) {
  const [items, setItems] = useState(() =>
    poll.data.options.map((opt) => ({ id: opt.id, text: opt.text }))
  )
  const [hasSubmitted, setHasSubmitted] = useState(false)

  // Report the current ranking to parent on every reorder (and on mount)
  useEffect(() => {
    const ranking = items.map((item) => item.id)
    const response = { ranking }
    if (onChange) onChange(response)
    else onSubmit(response)
  }, [items])

  const moveItem = useCallback((index: number, direction: "up" | "down") => {
    setItems((prev) => {
      const newItems = [...prev]
      const targetIndex = direction === "up" ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= newItems.length) return prev
      ;[newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]]
      return newItems
    })
  }, [])

  const handleSubmit = () => {
    const ranking = items.map((item) => item.id)
    setHasSubmitted(true)
    onSubmit({ ranking })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListOrdered className="h-5 w-5 text-blue-500" />
          {poll.data.question}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Use the arrow buttons to reorder items by your preference (top = most preferred)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                hasSubmitted ? "bg-muted/50" : "bg-background hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-1 text-muted-foreground">
                <GripVertical className="h-4 w-4" />
                <span className="text-sm font-bold w-6 text-center">{index + 1}</span>
              </div>
              <span className="flex-1 font-medium">{item.text}</span>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => moveItem(index, "up")}
                  disabled={disabled || hasSubmitted || index === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => moveItem(index, "down")}
                  disabled={disabled || hasSubmitted || index === items.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={disabled || hasSubmitted}
          className="w-full"
        >
          {hasSubmitted ? "Ranking Submitted" : "Submit Ranking"}
        </Button>
      </CardContent>
    </Card>
  )
}
