"use client"

import { useState, useEffect } from "react"
import { WhiteboardCanvas } from "@/components/whiteboard-canvas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
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
  participantId,
  participantName,
  onResponse,
}: WhiteboardParticipantProps) {
  const [elements, setElements] = useState<WhiteboardElement[]>([])
  const [participantCount, setParticipantCount] = useState(1)
  const [isConnected, setIsConnected] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    const initialElements: WhiteboardElement[] = [
      {
        id: "demo-1",
        type: "sticky-note",
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        content: "Great idea! Let's explore this further.",
        color: "#fef08a",
        participantId: "demo-participant-1",
        participantName: "Alex",
        timestamp: new Date().toISOString(),
      },
      {
        id: "demo-2",
        type: "text",
        x: 400,
        y: 200,
        content: "Key insights:",
        color: "#1f2937",
        participantId: "demo-participant-2",
        participantName: "Sarah",
        timestamp: new Date().toISOString(),
      },
    ]

    setElements(initialElements)
    setParticipantCount(Math.floor(Math.random() * 8) + 3)
  }, [])

  const handleElementsChange = (newElements: WhiteboardElement[]) => {
    const elementsWithParticipant = newElements.map((element) => {
      if (!element.participantId) {
        return {
          ...element,
          participantId,
          participantName,
          timestamp: new Date().toISOString(),
        }
      }
      return element
    })

    setElements(elementsWithParticipant)
  }

  const handleSubmitWhiteboard = () => {
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
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{poll.data.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {participantCount} active
              </Badge>
              <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
            </div>
          </div>
          {poll.data.instructions && <p className="text-sm text-muted-foreground mt-2">{poll.data.instructions}</p>}
        </CardHeader>
        <CardContent>
          <WhiteboardCanvas
            width={poll.data.canvasWidth}
            height={poll.data.canvasHeight}
            backgroundColor={poll.data.backgroundColor}
            allowDrawing={poll.data.allowDrawing}
            allowStickyNotes={poll.data.allowStickyNotes}
            allowText={poll.data.allowText}
            elements={elements}
            onElementsChange={handleElementsChange}
          />
          <div className="mt-4 flex justify-center">
            <Button onClick={handleSubmitWhiteboard} disabled={isSubmitted} className="px-8">
              {isSubmitted ? "Whiteboard Submitted" : "Submit Whiteboard"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {elements
              .filter((element) => element.participantName)
              .slice(-5)
              .reverse()
              .map((element) => (
                <div key={element.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary/60" />
                  <span className="font-medium">{element.participantName}</span>
                  <span>added a {element.type === "sticky-note" ? "sticky note" : element.type}</span>
                  <span className="ml-auto">
                    {element.timestamp &&
                      new Date(element.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </span>
                </div>
              ))}
            {elements.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                No activity yet. Be the first to contribute!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
