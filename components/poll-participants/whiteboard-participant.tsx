"use client"

import { useState } from "react"
import WhiteboardCanvas from "@/components/whiteboard-canvas"
import { Button } from "@/components/ui/button"
import type { WhiteboardPoll } from "@/types/poll-types"

interface WhiteboardElement {
  id: string
  type: "drawing" | "sticky-note" | "text"
  x: number
  y: number
  width?: number
  height?: number
  content?: string
  color?: string
  strokeWidth?: number
  path?: { x: number; y: number }[]
  participantId?: string
  participantName?: string
  timestamp?: string
}

interface WhiteboardParticipantProps {
  poll: WhiteboardPoll
  sessionId: string
  participantId?: string
  participantName?: string
  onResponse?: (response: any) => void
}

export function WhiteboardParticipant({
  poll,
  sessionId,
  participantId = `participant_${Date.now()}`,
  participantName = "Anonymous",
  onResponse,
}: WhiteboardParticipantProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmitWhiteboard = () => {
    const elementsKey = `whiteboard_elements_${sessionId}`
    const storedElements = localStorage.getItem(elementsKey)
    const elements = storedElements ? JSON.parse(storedElements) : []

    onResponse?.({
      type: "whiteboard-final",
      elements: elements,
      participantId,
      participantName,
      timestamp: new Date().toISOString(),
    })
    setIsSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{poll.data.title}</h1>
            {poll.data.instructions && <p className="text-sm text-muted-foreground mt-1">{poll.data.instructions}</p>}
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={handleSubmitWhiteboard} disabled={isSubmitted} className="px-8">
              {isSubmitted ? "Whiteboard Submitted" : "Submit Whiteboard"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <WhiteboardCanvas
          width={Math.max(poll.data.canvasWidth || 1400, 1400)}
          height={Math.max(poll.data.canvasHeight || 800, 800)}
          backgroundColor={poll.data.backgroundColor || "#ffffff"}
          allowDrawing={poll.data.allowDrawing !== false}
          allowStickyNotes={poll.data.allowStickyNotes !== false}
          allowText={poll.data.allowText !== false}
          pollId={sessionId}
          participantId={participantId}
          participantName={participantName}
          enableRealtime={true}
        />
      </div>
    </div>
  )
}
