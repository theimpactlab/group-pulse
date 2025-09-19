"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Pen, Type, Trash2, Download, Undo, Redo, MousePointer, StickyNote } from "lucide-react"
import { cn } from "@/lib/utils"

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
}

interface WhiteboardCanvasProps {
  width: number
  height: number
  backgroundColor: string
  allowDrawing: boolean
  allowStickyNotes: boolean
  allowText: boolean
  readOnly?: boolean
  elements?: WhiteboardElement[]
  onElementsChange?: (elements: WhiteboardElement[]) => void
}

type Tool = "select" | "pen" | "sticky-note" | "text" | "eraser"

export function WhiteboardCanvas({
  width,
  height,
  backgroundColor,
  allowDrawing,
  allowStickyNotes,
  allowText,
  readOnly = false,
  elements = [],
  onElementsChange,
}: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentTool, setCurrentTool] = useState<Tool>("select")
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [showTextInput, setShowTextInput] = useState(false)
  const [textInputPosition, setTextInputPosition] = useState({ x: 0, y: 0 })
  const [textInputValue, setTextInputValue] = useState("")
  const [showStickyNoteInput, setShowStickyNoteInput] = useState(false)
  const [stickyNotePosition, setStickyNotePosition] = useState({ x: 0, y: 0 })
  const [stickyNoteValue, setStickyNoteValue] = useState("")
  const [history, setHistory] = useState<WhiteboardElement[][]>([elements])
  const [historyIndex, setHistoryIndex] = useState(0)

  const addToHistory = useCallback(
    (newElements: WhiteboardElement[]) => {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push([...newElements])
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    },
    [history, historyIndex],
  )

  const updateElements = useCallback(
    (newElements: WhiteboardElement[]) => {
      onElementsChange?.(newElements)
      addToHistory(newElements)
    },
    [onElementsChange, addToHistory],
  )

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    // Draw all elements
    elements.forEach((element) => {
      if (element.type === "drawing" && element.path) {
        ctx.strokeStyle = element.color || "#000000"
        ctx.lineWidth = element.strokeWidth || 2
        ctx.lineCap = "round"
        ctx.lineJoin = "round"

        ctx.beginPath()
        element.path.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y)
          } else {
            ctx.lineTo(point.x, point.y)
          }
        })
        ctx.stroke()
      }
    })
  }, [elements, backgroundColor, width, height])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  const getMousePosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return

    const pos = getMousePosition(e)

    if (currentTool === "pen" && allowDrawing) {
      setIsDrawing(true)
      setCurrentPath([pos])
    } else if (currentTool === "text" && allowText) {
      setTextInputPosition(pos)
      setTextInputValue("")
      setShowTextInput(true)
    } else if (currentTool === "sticky-note" && allowStickyNotes) {
      setStickyNotePosition(pos)
      setStickyNoteValue("")
      setShowStickyNoteInput(true)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || currentTool !== "pen" || readOnly) return

    const pos = getMousePosition(e)
    setCurrentPath((prev) => [...prev, pos])

    // Draw current path in real-time
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    if (currentPath.length > 0) {
      const lastPoint = currentPath[currentPath.length - 1]
      ctx.beginPath()
      ctx.moveTo(lastPoint.x, lastPoint.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    }
  }

  const handleMouseUp = () => {
    if (isDrawing && currentPath.length > 0) {
      const newElement: WhiteboardElement = {
        id: Date.now().toString(),
        type: "drawing",
        x: Math.min(...currentPath.map((p) => p.x)),
        y: Math.min(...currentPath.map((p) => p.y)),
        path: currentPath,
        color: "#000000",
        strokeWidth: 2,
      }

      updateElements([...elements, newElement])
    }

    setIsDrawing(false)
    setCurrentPath([])
  }

  const handleTextSubmit = () => {
    if (textInputValue.trim()) {
      const newElement: WhiteboardElement = {
        id: Date.now().toString(),
        type: "text",
        x: textInputPosition.x,
        y: textInputPosition.y,
        content: textInputValue,
        color: "#000000",
      }

      updateElements([...elements, newElement])
    }

    setShowTextInput(false)
    setTextInputValue("")
  }

  const handleStickyNoteSubmit = () => {
    if (stickyNoteValue.trim()) {
      const newElement: WhiteboardElement = {
        id: Date.now().toString(),
        type: "sticky-note",
        x: stickyNotePosition.x,
        y: stickyNotePosition.y,
        width: 200,
        height: 150,
        content: stickyNoteValue,
        color: "#fef08a", // Yellow sticky note
      }

      updateElements([...elements, newElement])
    }

    setShowStickyNoteInput(false)
    setStickyNoteValue("")
  }

  const clearCanvas = () => {
    updateElements([])
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      const previousElements = history[historyIndex - 1]
      onElementsChange?.(previousElements)
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      const nextElements = history[historyIndex + 1]
      onElementsChange?.(nextElements)
    }
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = "whiteboard.png"
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="flex flex-col space-y-4">
      {!readOnly && (
        <div className="flex flex-wrap gap-2 p-4 bg-muted/50 rounded-lg">
          <Button
            variant={currentTool === "select" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentTool("select")}
          >
            <MousePointer className="h-4 w-4 mr-2" />
            Select
          </Button>

          {allowDrawing && (
            <Button
              variant={currentTool === "pen" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentTool("pen")}
            >
              <Pen className="h-4 w-4 mr-2" />
              Draw
            </Button>
          )}

          {allowStickyNotes && (
            <Button
              variant={currentTool === "sticky-note" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentTool("sticky-note")}
            >
              <StickyNote className="h-4 w-4 mr-2" />
              Sticky Note
            </Button>
          )}

          {allowText && (
            <Button
              variant={currentTool === "text" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentTool("text")}
            >
              <Type className="h-4 w-4 mr-2" />
              Text
            </Button>
          )}

          <div className="flex-1" />

          <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
            <Undo className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
            <Redo className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={clearCanvas}>
            <Trash2 className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={downloadCanvas}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div
        ref={containerRef}
        className="relative border rounded-lg overflow-hidden"
        style={{ width: width, height: height }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className={cn(
            "absolute top-0 left-0",
            !readOnly && currentTool === "pen" && "cursor-crosshair",
            !readOnly && currentTool === "text" && "cursor-text",
            !readOnly && currentTool === "sticky-note" && "cursor-pointer",
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {/* Render sticky notes and text elements */}
        {elements.map((element) => {
          if (element.type === "sticky-note") {
            return (
              <div
                key={element.id}
                className="absolute p-3 rounded shadow-md text-sm"
                style={{
                  left: element.x,
                  top: element.y,
                  width: element.width,
                  height: element.height,
                  backgroundColor: element.color,
                  border: "1px solid #d1d5db",
                }}
              >
                {element.content}
              </div>
            )
          }

          if (element.type === "text") {
            return (
              <div
                key={element.id}
                className="absolute text-sm font-medium"
                style={{
                  left: element.x,
                  top: element.y,
                  color: element.color,
                }}
              >
                {element.content}
              </div>
            )
          }

          return null
        })}

        {/* Text input overlay */}
        {showTextInput && (
          <div
            className="absolute z-10"
            style={{
              left: textInputPosition.x,
              top: textInputPosition.y,
            }}
          >
            <Card className="p-2">
              <Input
                value={textInputValue}
                onChange={(e) => setTextInputValue(e.target.value)}
                placeholder="Enter text..."
                className="mb-2"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleTextSubmit()
                  } else if (e.key === "Escape") {
                    setShowTextInput(false)
                  }
                }}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleTextSubmit}>
                  Add
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowTextInput(false)}>
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Sticky note input overlay */}
        {showStickyNoteInput && (
          <div
            className="absolute z-10"
            style={{
              left: stickyNotePosition.x,
              top: stickyNotePosition.y,
            }}
          >
            <Card className="p-2 w-64">
              <Textarea
                value={stickyNoteValue}
                onChange={(e) => setStickyNoteValue(e.target.value)}
                placeholder="Enter sticky note content..."
                className="mb-2"
                rows={3}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setShowStickyNoteInput(false)
                  }
                }}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleStickyNoteSubmit}>
                  Add Note
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowStickyNoteInput(false)}>
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
