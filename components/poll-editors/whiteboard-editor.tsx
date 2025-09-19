"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { WhiteboardPoll } from "@/types/poll-types"

interface WhiteboardEditorProps {
  poll: WhiteboardPoll
  onChange: (poll: WhiteboardPoll) => void
}

export function WhiteboardEditor({ poll, onChange }: WhiteboardEditorProps) {
  const handleTitleChange = (title: string) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        title,
      },
    })
  }

  const handleInstructionsChange = (instructions: string) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        instructions,
      },
    })
  }

  const handleCanvasWidthChange = (value: number[]) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        canvasWidth: value[0],
      },
    })
  }

  const handleCanvasHeightChange = (value: number[]) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        canvasHeight: value[0],
      },
    })
  }

  const handleAllowDrawingChange = (checked: boolean) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        allowDrawing: checked,
      },
    })
  }

  const handleAllowStickyNotesChange = (checked: boolean) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        allowStickyNotes: checked,
      },
    })
  }

  const handleAllowTextChange = (checked: boolean) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        allowText: checked,
      },
    })
  }

  const handleBackgroundColorChange = (backgroundColor: string) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        backgroundColor,
      },
    })
  }

  const handleMaxParticipantsChange = (value: number[]) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        maxParticipants: value[0] === 0 ? undefined : value[0],
      },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title">Whiteboard Title</Label>
        <Input
          id="title"
          value={poll.data.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Enter whiteboard title"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="instructions">Instructions (Optional)</Label>
        <Textarea
          id="instructions"
          value={poll.data.instructions || ""}
          onChange={(e) => handleInstructionsChange(e.target.value)}
          placeholder="Provide instructions for participants..."
          className="mt-1"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="canvasWidth">Canvas Width: {poll.data.canvasWidth}px</Label>
          <Slider
            id="canvasWidth"
            min={800}
            max={2000}
            step={50}
            value={[poll.data.canvasWidth]}
            onValueChange={handleCanvasWidthChange}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="canvasHeight">Canvas Height: {poll.data.canvasHeight}px</Label>
          <Slider
            id="canvasHeight"
            min={600}
            max={1500}
            step={50}
            value={[poll.data.canvasHeight]}
            onValueChange={handleCanvasHeightChange}
            className="mt-2"
          />
        </div>
      </div>

      <div>
        <Label>Background Color</Label>
        <Select value={poll.data.backgroundColor} onValueChange={handleBackgroundColorChange}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select background color" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="#ffffff">White</SelectItem>
            <SelectItem value="#f8f9fa">Light Gray</SelectItem>
            <SelectItem value="#e3f2fd">Light Blue</SelectItem>
            <SelectItem value="#f3e5f5">Light Purple</SelectItem>
            <SelectItem value="#e8f5e8">Light Green</SelectItem>
            <SelectItem value="#fff3e0">Light Orange</SelectItem>
            <SelectItem value="#fce4ec">Light Pink</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-base font-medium">Allowed Tools</Label>
        <div className="space-y-3 mt-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="allowDrawing" checked={poll.data.allowDrawing} onCheckedChange={handleAllowDrawingChange} />
            <Label htmlFor="allowDrawing">Allow drawing and sketching</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="allowStickyNotes"
              checked={poll.data.allowStickyNotes}
              onCheckedChange={handleAllowStickyNotesChange}
            />
            <Label htmlFor="allowStickyNotes">Allow sticky notes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="allowText" checked={poll.data.allowText} onCheckedChange={handleAllowTextChange} />
            <Label htmlFor="allowText">Allow text annotations</Label>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="maxParticipants">Maximum Participants: {poll.data.maxParticipants || "Unlimited"}</Label>
        <Slider
          id="maxParticipants"
          min={0}
          max={100}
          step={5}
          value={[poll.data.maxParticipants || 0]}
          onValueChange={handleMaxParticipantsChange}
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-1">Set to 0 for unlimited participants</p>
      </div>
    </div>
  )
}
