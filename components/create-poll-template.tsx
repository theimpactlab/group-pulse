"use client"

import { v4 as uuidv4 } from "uuid"
import type { PollType } from "@/types/poll-types"

export function createPollTemplate(type: string): PollType {
  const id = uuidv4()

  switch (type) {
    case "multiple-choice":
      return {
        id,
        type: "multiple-choice",
        data: {
          question: "What is your favorite option?",
          options: [
            { id: uuidv4(), text: "Option 1" },
            { id: uuidv4(), text: "Option 2" },
          ],
          allowMultipleAnswers: false,
        },
      }
    case "word-cloud":
      return {
        id,
        type: "word-cloud",
        data: {
          question: "What words come to mind when you think about...?",
          maxEntries: 3,
        },
      }
    case "open-ended":
      return {
        id,
        type: "open-ended",
        data: {
          question: "What are your thoughts on this topic?",
          maxResponseLength: 200,
        },
      }
    case "scale":
      return {
        id,
        type: "scale",
        data: {
          question: "How would you rate this on a scale?",
          min: 1,
          max: 10,
          minLabel: "Not at all",
          maxLabel: "Very much",
          step: 1,
        },
      }
    case "ranking":
      return {
        id,
        type: "ranking",
        data: {
          question: "Rank the following items in order of preference:",
          options: [
            { id: uuidv4(), text: "Item 1" },
            { id: uuidv4(), text: "Item 2" },
            { id: uuidv4(), text: "Item 3" },
          ],
        },
      }
    case "qa":
      return {
        id,
        type: "qa",
        data: {
          title: "Q&A Session",
          description: "Ask your questions here",
          allowAnonymous: true,
          allowUpvoting: true,
        },
      }
    case "quiz":
      return {
        id,
        type: "quiz",
        data: {
          question: "Quiz question?",
          options: [
            { id: uuidv4(), text: "Option 1", isCorrect: true },
            { id: uuidv4(), text: "Option 2", isCorrect: false },
          ],
          showCorrectAnswer: true,
          pointsPerQuestion: 1,
        },
      }
    case "image-choice":
      return {
        id,
        type: "image-choice",
        data: {
          question: "Which image do you prefer?",
          options: [
            {
              id: uuidv4(),
              imageUrl: "/placeholder.svg?height=200&width=300",
              caption: "Image 1",
            },
            {
              id: uuidv4(),
              imageUrl: "/placeholder.svg?height=200&width=300",
              caption: "Image 2",
            },
          ],
        },
      }
    default:
      throw new Error(`Unknown poll type: ${type}`)
  }
}

