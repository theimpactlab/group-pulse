"use client"
import WhiteboardCanvas from "@/components/whiteboard-canvas"
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
  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-xl font-bold">{poll.data.title}</h2>
        {poll.data.instructions && <p className="text-sm text-muted-foreground mt-1">{poll.data.instructions}</p>}
      </div>

      <div className="w-full overflow-auto">
        <WhiteboardCanvas
          width={Math.min(poll.data.canvasWidth || 1200, 1200)}
          height={Math.min(poll.data.canvasHeight || 600, 600)}
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
