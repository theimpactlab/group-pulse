// Base interface for all interactive elements
export interface InteractiveElement {
  id: string
  type: string
}

// Multiple Choice Poll (Single selection)
export interface MultipleChoicePoll extends InteractiveElement {
  type: "multiple-choice"
  data: {
    question: string
    options: {
      id: string
      text: string
    }[]
    allowMultipleAnswers: boolean
  }
}

// Word Cloud
export interface WordCloudPoll extends InteractiveElement {
  type: "word-cloud"
  data: {
    question: string
    maxEntries: number // Maximum entries per participant
  }
}

// Open-ended Question
export interface OpenEndedPoll extends InteractiveElement {
  type: "open-ended"
  data: {
    question: string
    maxResponseLength?: number
  }
}

// Scale Question (e.g., 1-10)
export interface ScalePoll extends InteractiveElement {
  type: "scale"
  data: {
    question: string
    min: number
    max: number
    minLabel?: string
    maxLabel?: string
    step: number
  }
}

// Slider Poll (preference between two options)
export interface SliderPoll extends InteractiveElement {
  type: "slider"
  data: {
    question: string
    leftOption: string
    rightOption: string
    steps: number // Number of steps/positions on the slider
  }
}

// Ranking Poll
export interface RankingPoll extends InteractiveElement {
  type: "ranking"
  data: {
    question: string
    options: {
      id: string
      text: string
    }[]
  }
}

// Q&A Session
export interface QAPoll extends InteractiveElement {
  type: "qa"
  data: {
    title: string
    description?: string
    allowAnonymous: boolean
    allowUpvoting: boolean
  }
}

// Quiz Question
export interface QuizPoll extends InteractiveElement {
  type: "quiz"
  data: {
    question: string
    options: {
      id: string
      text: string
      isCorrect: boolean
    }[]
    showCorrectAnswer: boolean
    pointsPerQuestion?: number
  }
}

// Image Choice Poll
export interface ImageChoicePoll extends InteractiveElement {
  type: "image-choice"
  data: {
    question: string
    options: {
      id: string
      imageUrl: string
      caption?: string
    }[]
  }
}

// Union type of all poll types
export type PollType =
  | MultipleChoicePoll
  | WordCloudPoll
  | OpenEndedPoll
  | ScalePoll
  | SliderPoll
  | RankingPoll
  | QAPoll
  | QuizPoll
  | ImageChoicePoll

// Poll response types
export interface PollResponse {
  id: string
  pollId: string
  sessionId: string
  participantId?: string
  participantName?: string
  timestamp: string
  response: any // Type depends on the poll type
}
