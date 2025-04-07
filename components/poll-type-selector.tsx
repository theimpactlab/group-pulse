"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface PollTypeSelectorProps {
  onSelect: (pollType: string) => void
}

interface PollTypeOption {
  id: string
  type: string
  title: string
  description: string
  icon: React.ReactNode
}

export function PollTypeSelector({ onSelect }: PollTypeSelectorProps) {
  const [open, setOpen] = useState(false)

  const pollTypes: PollTypeOption[] = [
    {
      id: "multiple-choice",
      type: "multiple-choice",
      title: "Multiple Choice",
      description: "Let your audience choose from options",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-blue-500"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
    {
      id: "word-cloud",
      type: "word-cloud",
      title: "Word Cloud",
      description: "Collect words that form a cloud",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-purple-500"
        >
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
          <path d="M12 12v9" />
          <path d="m8 17 4-5 4 5" />
        </svg>
      ),
    },
    {
      id: "open-ended",
      type: "open-ended",
      title: "Open-ended",
      description: "Collect free text responses",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-green-500"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      ),
    },
    {
      id: "scale",
      type: "scale",
      title: "Scale",
      description: "Rate on a numeric scale",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-amber-500"
        >
          <path d="M2 12h20" />
          <path d="M6 8v8" />
          <path d="M12 4v16" />
          <path d="M18 8v8" />
        </svg>
      ),
    },
    {
      id: "ranking",
      type: "ranking",
      title: "Ranking",
      description: "Order options by preference",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-red-500"
        >
          <path d="M4 10h16" />
          <path d="M4 14h16" />
          <path d="M4 18h16" />
          <path d="M8 6h12" />
          <path d="M4 6h.01" />
        </svg>
      ),
    },
    {
      id: "qa",
      type: "qa",
      title: "Q&A",
      description: "Collect and answer questions",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-cyan-500"
        >
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <circle cx="12" cy="12" r="10" />
          <path d="M12 17h.01" />
        </svg>
      ),
    },
    {
      id: "quiz",
      type: "quiz",
      title: "Quiz",
      description: "Test knowledge with correct answers",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-indigo-500"
        >
          <path d="M9 11h6" />
          <path d="M12 15h3" />
          <path d="M10 7H8" />
          <rect width="18" height="18" x="3" y="3" rx="2" />
        </svg>
      ),
    },
    {
      id: "image-choice",
      type: "image-choice",
      title: "Image Choice",
      description: "Choose from images",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-pink-500"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      ),
    },
  ]

  const handleSelect = (type: string) => {
    onSelect(type)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add Content
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Choose a content type</DialogTitle>
          <DialogDescription>Select the type of interactive content you want to add to your session.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {pollTypes.map((pollType) => (
            <Card
              key={pollType.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleSelect(pollType.type)}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div className="mt-1">{pollType.icon}</div>
                <div>
                  <h3 className="font-medium">{pollType.title}</h3>
                  <p className="text-sm text-muted-foreground">{pollType.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

