"use client"
import type { PollType } from "@/types/poll-types"
import { MultipleChoiceEditor } from "./poll-editors/multiple-choice-editor"
import { WordCloudEditor } from "./poll-editors/word-cloud-editor"
import { OpenEndedEditor } from "./poll-editors/open-ended-editor"
import { ScaleEditor } from "./poll-editors/scale-editor"
import { SliderEditor } from "./poll-editors/slider-editor"
import { RankingEditor } from "./poll-editors/ranking-editor"
import { QAEditor } from "./poll-editors/qa-editor"
import { QuizEditor } from "./poll-editors/quiz-editor"
import { ImageChoiceEditor } from "./poll-editors/image-choice-editor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface PollEditorProps {
  poll: PollType
  onChange: (poll: PollType) => void
  onDelete: () => void
}

export function PollEditor({ poll, onChange, onDelete }: PollEditorProps) {
  const renderEditor = () => {
    switch (poll.type) {
      case "multiple-choice":
        return <MultipleChoiceEditor poll={poll} onChange={onChange} />
      case "word-cloud":
        return <WordCloudEditor poll={poll} onChange={onChange} />
      case "open-ended":
        return <OpenEndedEditor poll={poll} onChange={onChange} />
      case "scale":
        return <ScaleEditor poll={poll} onChange={onChange} />
      case "slider":
        return <SliderEditor poll={poll} onChange={onChange} />
      case "ranking":
        return <RankingEditor poll={poll} onChange={onChange} />
      case "qa":
        return <QAEditor poll={poll} onChange={onChange} />
      case "quiz":
        return <QuizEditor poll={poll} onChange={onChange} />
      case "image-choice":
        return <ImageChoiceEditor poll={poll} onChange={onChange} />
      default:
        return <div>Unknown poll type</div>
    }
  }

  const getPollTypeTitle = () => {
    switch (poll.type) {
      case "multiple-choice":
        return "Multiple Choice"
      case "word-cloud":
        return "Word Cloud"
      case "open-ended":
        return "Open-ended Question"
      case "scale":
        return "Scale"
      case "slider":
        return "Slider"
      case "ranking":
        return "Ranking"
      case "qa":
        return "Q&A"
      case "quiz":
        return "Quiz"
      case "image-choice":
        return "Image Choice"
      default:
        return "Unknown Type"
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{getPollTypeTitle()}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onDelete} className="h-8 w-8 p-0">
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </CardHeader>
      <CardContent>{renderEditor()}</CardContent>
    </Card>
  )
}
