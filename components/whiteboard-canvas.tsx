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
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
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

    if (selectedElement) {
      const element = elements.find((e) => e.id === selectedElement)
      if (element && element.type !== "drawing") {
        ctx.strokeStyle = "#3b82f6"
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.strokeRect(element.x - 5, element.y - 5, (element.width || 100) + 10, (element.height || 30) + 10)
        ctx.setLineDash([])
      }
    }
  }, [elements, backgroundColor, width, height, selectedElement])

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

  const getElementAtPosition = (x: number, y: number): WhiteboardElement | null => {
    // Check in reverse order (top to bottom)
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i]
      if (element.type === "sticky-note" || element.type === "text") {
        const elementWidth = element.width || (element.type === "text" ? 100 : 200)
        const elementHeight = element.height || (element.type === "text" ? 30 : 150)

        if (x >= element.x && x <= element.x + elementWidth && y >= element.y && y <= element.y + elementHeight) {
          return element
        }
      }
    }
    return null
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return

    e.preventDefault()
    e.stopPropagation()

    const pos = getMousePosition(e)

    if (currentTool === "select") {
      const clickedElement = getElementAtPosition(pos.x, pos.y)
      if (clickedElement) {
        setSelectedElement(clickedElement.id)
        setIsDragging(true)
        setDragOffset({
          x: pos.x - clickedElement.x,
          y: pos.y - clickedElement.y,
        })
      } else {
        setSelectedElement(null)
      }
    } else if (currentTool === "pen" && allowDrawing) {
      setIsDrawing(true)
      setCurrentPath([pos])
      setSelectedElement(null)
    } else if (currentTool === "text" && allowText) {
      setTextInputPosition(pos)
      setTextInputValue("")
      setShowTextInput(true)
      setSelectedElement(null)
    } else if (currentTool === "sticky-note" && allowStickyNotes) {
      setStickyNotePosition(pos)
      setStickyNoteValue("")
      setShowStickyNoteInput(true)
      setSelectedElement(null)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return

    const pos = getMousePosition(e)

    if (isDragging && selectedElement && currentTool === "select") {
      const newElements = elements.map((element) => {
        if (element.id === selectedElement) {
          return {
            ...element,
            x: pos.x - dragOffset.x,
            y: pos.y - dragOffset.y,
          }
        }
        return element
      })
      onElementsChange?.(newElements)
      return
    }

    if (!isDrawing || currentTool !== "pen") return

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
    if (isDragging) {
      setIsDragging(false)
      // Add to history when drag is complete
      addToHistory(elements)
    }

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

  const deleteSelectedElement = () => {
    if (selectedElement) {
      const newElements = elements.filter((element) => element.id !== selectedElement)
      updateElements(newElements)
      setSelectedElement(null)
    }
  }

  const clearCanvas = () => {
    updateElements([])
    setSelectedElement(null)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      const previousElements = history[historyIndex - 1]
      onElementsChange?.(previousElements)
      setSelectedElement(null)
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      const nextElements = history[historyIndex + 1]
      onElementsChange?.(nextElements)
      setSelectedElement(null)
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
            onClick={(e) => {
              e.preventDefault()
              setCurrentTool("select")
            }}
            type="button"
          >
            <MousePointer className="h-4 w-4 mr-2" />
            Select
          </Button>

          {allowDrawing && (
            <Button
              variant={currentTool === "pen" ? "default" : "outline"}
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                setCurrentTool("pen")
              }}
              type="button"
            >
              <Pen className="h-4 w-4 mr-2" />
              Draw
            </Button>
          )}

          {allowStickyNotes && (
            <Button
              variant={currentTool === "sticky-note" ? "default" : "outline"}
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                setCurrentTool("sticky-note")
              }}
              type="button"
            >
              <StickyNote className="h-4 w-4 mr-2" />
              Sticky Note
            </Button>
          )}

          {allowText && (
            <Button
              variant={currentTool === "text" ? "default" : "outline"}
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                setCurrentTool("text")
              }}
              type="button"
            >
              <Type className="h-4 w-4 mr-2" />
              Text
            </Button>
          )}

          <div className="flex-1" />

          {selectedElement && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                deleteSelectedElement()
              }}
              type="button"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              undo()
            }}
            disabled={historyIndex <= 0}
            type="button"
          >
            <Undo className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              redo()
            }}
            disabled={historyIndex >= history.length - 1}
            type="button"
          >
            <Redo className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              clearCanvas()
            }}
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              downloadCanvas()
            }}
            type="button"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex justify-center">
        <div
          ref={containerRef}
          className="relative border rounded-lg overflow-hidden shadow-sm"
          style={{ width: Math.min(width, 800), height: Math.min(height, 600) }}
        >
          <canvas
            ref={canvasRef}
            width={Math.min(width, 800)}
            height={Math.min(height, 600)}
            className={cn(
              "absolute top-0 left-0 bg-white",
              !readOnly && currentTool === "pen" && "cursor-crosshair",
              !readOnly && currentTool === "text" && "cursor-text",
              !readOnly && currentTool === "sticky-note" && "cursor-pointer",
              !readOnly && currentTool === "select" && "cursor-pointer",
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
                  className={cn(
                    "absolute p-3 rounded shadow-md text-sm cursor-pointer transition-all",
                    selectedElement === element.id && "ring-2 ring-blue-500 ring-offset-2",
                  )}
                  style={{
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    height: element.height,
                    backgroundColor: element.color,
                    border: "1px solid #d1d5db",
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (currentTool === "select") {
                      setSelectedElement(element.id)
                    }
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
                  className={cn(
                    "absolute text-sm font-medium cursor-pointer transition-all",
                    selectedElement === element.id && "ring-2 ring-blue-500 ring-offset-2 bg-blue-50 px-1 rounded",
                  )}
                  style={{
                    left: element.x,
                    top: element.y,
                    color: element.color,
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (currentTool === "select") {
                      setSelectedElement(element.id)
                    }
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
                      e.preventDefault()
                      handleTextSubmit()
                    } else if (e.key === "Escape") {
                      setShowTextInput(false)
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      handleTextSubmit()
                    }}
                    type="button"
                  >
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault()
                      setShowTextInput(false)
                    }}
                    type="button"
                  >
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
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      handleStickyNoteSubmit()
                    }}
                    type="button"
                  >
                    Add Note
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault()
                      setShowStickyNoteInput(false)
                    }}
                    type="button"
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
