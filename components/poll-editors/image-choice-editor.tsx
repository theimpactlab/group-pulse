"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import type { ImageChoicePoll } from "@/types/poll-types"

interface ImageChoiceEditorProps {
  poll: ImageChoicePoll
  onChange: (poll: ImageChoicePoll) => void
}

export function ImageChoiceEditor({ poll, onChange }: ImageChoiceEditorProps) {
  const handleQuestionChange = (question: string) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        question,
      },
    })
  }

  const handleCaptionChange = (id: string, caption: string) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        options: poll.data.options.map((option) => (option.id === id ? { ...option, caption } : option)),
      },
    })
  }

  const handleImageUrlChange = (id: string, imageUrl: string) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        options: poll.data.options.map((option) => (option.id === id ? { ...option, imageUrl } : option)),
      },
    })
  }

  const handleAddOption = () => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        options: [...poll.data.options, { id: uuidv4(), imageUrl: "", caption: "" }],
      },
    })
  }

  const handleRemoveOption = (id: string) => {
    onChange({
      ...poll,
      data: {
        ...poll.data,
        options: poll.data.options.filter((option) => option.id !== id),
      },
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="question">Question</Label>
        <Input
          id="question"
          value={poll.data.question}
          onChange={(e) => handleQuestionChange(e.target.value)}
          placeholder="Enter your question"
          className="mt-1"
        />
      </div>

      <div>
        <Label>Image Options</Label>
        <div className="space-y-4 mt-1">
          {poll.data.options.map((option, index) => (
            <div key={option.id} className="border rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Image {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveOption(option.id)}
                  disabled={poll.data.options.length <= 2}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor={`imageUrl-${option.id}`}>Image URL</Label>
                  <Input
                    id={`imageUrl-${option.id}`}
                    value={option.imageUrl}
                    onChange={(e) => handleImageUrlChange(option.id, e.target.value)}
                    placeholder="Enter image URL"
                    className="mt-1"
                  />
                </div>

                {option.imageUrl && (
                  <div className="border rounded-md p-2 bg-muted/50">
                    <img
                      src={option.imageUrl || "/placeholder.svg"}
                      alt={option.caption || `Option ${index + 1}`}
                      className="max-h-32 mx-auto object-contain"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=100&width=200"
                      }}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor={`caption-${option.id}`}>Caption (optional)</Label>
                  <Input
                    id={`caption-${option.id}`}
                    value={option.caption || ""}
                    onChange={(e) => handleCaptionChange(option.id, e.target.value)}
                    placeholder="Enter caption"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleAddOption} className="mt-2">
          <Plus className="h-4 w-4 mr-2" /> Add Image Option
        </Button>
      </div>
    </div>
  )
}

