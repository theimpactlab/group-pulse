"use client"

interface WordCloudResultsProps {
  poll: any
  pollResponses: any[]
}

interface NormalizedWordResponse {
  word: string
  participantName: string
}

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
  const wordCounts: Record<string, { label: string; count: number }> = {}

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

  return { rawResponses, sortedWords, maxCount }
}

export function WordCloudResults({ poll, pollResponses }: WordCloudResultsProps) {
  const { rawResponses, sortedWords, maxCount } = getWordCloudData(pollResponses)

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

      <div className="min-h-[260px] rounded-lg border bg-gradient-to-br from-gray-50 to-white p-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-4">
        {sortedWords.map((word) => {
          const scale = word.count / maxCount
          const fontSize = Math.round(18 + scale * 34)
          const opacity = 0.72 + scale * 0.28

          return (
            <span
              key={word.label.toLowerCase()}
              className="font-semibold text-primary leading-none"
              style={{ fontSize: `${fontSize}px`, opacity }}
              title={`${word.label}: ${word.count}`}
            >
              {word.label}
            </span>
          )
        })}
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
