"use client"

interface WordCloudResultsProps {
  poll: any
  pollResponses: any[]
}

interface NormalizedWordResponse {
  word: string
  participantName: string
}

interface WordCount {
  label: string
  count: number
}

interface PositionedWord extends WordCount {
  x: number
  y: number
  rotate: number
  fontSize: number
  colour: string
  opacity: number
  zIndex: number
}

const WORD_CLOUD_COLOURS = ["#2563eb", "#7c3aed", "#0f766e", "#db2777", "#ea580c", "#334155", "#0891b2"]
const WORD_CLOUD_ROTATIONS = [0, 0, 0, 0, -14, 14, -8, 8]

function normaliseResponseData(rawResponse: any): string[] {
  let responseData = rawResponse

  if (typeof responseData === "string") {
    try {
      responseData = JSON.parse(responseData)
    } catch {
      return responseData.trim() ? [responseData.trim()] : []
    }
  }

  if (Array.isArray(responseData)) {
    return responseData.map(String).map((word) => word.trim()).filter(Boolean)
  }

  if (Array.isArray(responseData?.responses)) {
    return responseData.responses.map(String).map((word: string) => word.trim()).filter(Boolean)
  }

  if (typeof responseData?.word === "string") {
    return responseData.word.trim() ? [responseData.word.trim()] : []
  }

  return []
}

function getWordCloudData(pollResponses: any[]) {
  const rawResponses: NormalizedWordResponse[] = []
  const wordCounts: Record<string, WordCount> = {}

  pollResponses.forEach((response, responseIndex) => {
    const participantName = response.participant_name || response.participantName || `Participant ${responseIndex + 1}`
    const words = normaliseResponseData(response.response)

    words.forEach((word) => {
      const cleanedWord = word.replace(/\s+/g, " ").trim()
      if (!cleanedWord) return

      const key = cleanedWord.toLowerCase()
      rawResponses.push({ word: cleanedWord, participantName })

      if (!wordCounts[key]) {
        wordCounts[key] = { label: cleanedWord, count: 0 }
      }

      wordCounts[key].count += 1
    })
  })

  const sortedWords = Object.values(wordCounts).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
  const maxCount = sortedWords[0]?.count || 1
  const minCount = sortedWords[sortedWords.length - 1]?.count || 1

  return { rawResponses, sortedWords, maxCount, minCount }
}

function getPositionedWords(words: WordCount[], maxCount: number, minCount: number): PositionedWord[] {
  const visibleWords = words.slice(0, 80)
  const countRange = Math.max(maxCount - minCount, 1)
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))

  return visibleWords.map((word, index) => {
    const countScale = maxCount === minCount ? 0.62 : (word.count - minCount) / countRange
    const fontSize = Math.round(18 + countScale * 54)

    if (index === 0) {
      return {
        ...word,
        x: 50,
        y: 50,
        rotate: 0,
        fontSize,
        colour: WORD_CLOUD_COLOURS[0],
        opacity: 1,
        zIndex: visibleWords.length,
      }
    }

    const ring = Math.ceil(Math.sqrt(index))
    const angle = index * goldenAngle
    const radiusX = Math.min(7 + ring * 7.4, 43)
    const radiusY = Math.min(5 + ring * 5.6, 34)
    const x = 50 + Math.cos(angle) * radiusX
    const y = 50 + Math.sin(angle) * radiusY

    return {
      ...word,
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(12, Math.min(88, y)),
      rotate: WORD_CLOUD_ROTATIONS[index % WORD_CLOUD_ROTATIONS.length],
      fontSize,
      colour: WORD_CLOUD_COLOURS[index % WORD_CLOUD_COLOURS.length],
      opacity: 0.72 + countScale * 0.28,
      zIndex: visibleWords.length - index,
    }
  })
}

export function WordCloudResults({ poll, pollResponses }: WordCloudResultsProps) {
  const { rawResponses, sortedWords, maxCount, minCount } = getWordCloudData(pollResponses)
  const positionedWords = getPositionedWords(sortedWords, maxCount, minCount)

  if (sortedWords.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{String(poll.data.question)}</h3>
        <div className="p-6 text-center bg-gray-50 rounded-lg">
          <p className="text-muted-foreground">No word cloud responses yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{String(poll.data.question)}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {rawResponses.length} total response{rawResponses.length !== 1 ? "s" : ""} from {pollResponses.length} participant
          {pollResponses.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <h4 className="font-medium">Word cloud</h4>
          <p className="text-sm text-muted-foreground">Larger words were mentioned more often by the group.</p>
        </div>

        <div className="relative h-[440px] overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
          <div className="absolute inset-0 opacity-70 [background:radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.10),transparent_36%),radial-gradient(circle_at_18%_24%,rgba(124,58,237,0.10),transparent_24%),radial-gradient(circle_at_78%_72%,rgba(15,118,110,0.10),transparent_26%)]" />
          <div className="absolute inset-4 rounded-[2rem] border border-white/80 bg-white/35 shadow-inner" />

          {positionedWords.map((word) => (
            <span
              key={word.label.toLowerCase()}
              className="absolute max-w-[36%] -translate-x-1/2 -translate-y-1/2 select-none text-center font-extrabold leading-none tracking-tight drop-shadow-sm transition-transform duration-200 hover:scale-110"
              style={{
                left: `${word.x}%`,
                top: `${word.y}%`,
                transform: `translate(-50%, -50%) rotate(${word.rotate}deg)`,
                fontSize: `clamp(1rem, ${word.fontSize}px, 4.8rem)`,
                color: word.colour,
                opacity: word.opacity,
                zIndex: word.zIndex,
              }}
              title={`${word.label}: ${word.count}`}
            >
              {word.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {sortedWords.slice(0, 14).map((word) => (
          <span key={word.label.toLowerCase()} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
            {word.label} <span className="font-semibold text-slate-950">{word.count}</span>
          </span>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h4 className="font-medium mb-3">Frequency table</h4>
          <div className="space-y-2 max-h-[360px] overflow-y-auto rounded-lg border p-3">
            {sortedWords.map((word) => {
              const percentage = Math.round((word.count / rawResponses.length) * 100)

              return (
                <div key={word.label.toLowerCase()} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{word.label}</span>
                    <span className="font-medium">
                      {word.count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Raw responses</h4>
          <div className="space-y-2 max-h-[360px] overflow-y-auto rounded-lg border p-3">
            {rawResponses.map((response, index) => (
              <div
                key={`${response.participantName}-${response.word}-${index}`}
                className="flex justify-between gap-4 rounded bg-gray-50 p-2 text-sm"
              >
                <span>{response.word}</span>
                <span className="text-muted-foreground whitespace-nowrap">{response.participantName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
