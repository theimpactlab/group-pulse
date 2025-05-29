import { Card, CardContent } from "@/components/ui/card"

const pollTypes = [
  {
    id: "multiple-choice",
    title: "Multiple Choice",
    description: "Let your audience choose from options",
    icon: (
      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    color: "bg-blue-50 border-blue-200",
  },
  {
    id: "word-cloud",
    title: "Word Cloud",
    description: "Collect words that form a cloud",
    icon: (
      <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
        <path d="M12 12v9" />
        <path d="m8 17 4-5 4 5" />
      </svg>
    ),
    color: "bg-purple-50 border-purple-200",
  },
  {
    id: "open-ended",
    title: "Open-ended",
    description: "Collect free text responses",
    icon: (
      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    ),
    color: "bg-green-50 border-green-200",
  },
  {
    id: "scale",
    title: "Scale",
    description: "Rate on a numeric scale",
    icon: (
      <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M2 12h20" />
        <path d="M6 8v8" />
        <path d="M12 4v16" />
        <path d="M18 8v8" />
      </svg>
    ),
    color: "bg-amber-50 border-amber-200",
  },
  {
    id: "slider",
    title: "Slider",
    description: "Choose between two options",
    icon: (
      <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="4" y1="18" x2="20" y2="18" />
        <circle cx="14" cy="6" r="2" />
        <circle cx="8" cy="12" r="2" />
        <circle cx="16" cy="18" r="2" />
      </svg>
    ),
    color: "bg-teal-50 border-teal-200",
  },
  {
    id: "ranking",
    title: "Ranking",
    description: "Order options by preference",
    icon: (
      <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M4 10h16" />
        <path d="M4 14h16" />
        <path d="M4 18h16" />
        <path d="M8 6h12" />
        <path d="M4 6h.01" />
      </svg>
    ),
    color: "bg-red-50 border-red-200",
  },
  {
    id: "qa",
    title: "Q&A",
    description: "Collect and answer questions",
    icon: (
      <svg className="w-8 h-8 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <circle cx="12" cy="12" r="10" />
        <path d="M12 17h.01" />
      </svg>
    ),
    color: "bg-cyan-50 border-cyan-200",
  },
  {
    id: "quiz",
    title: "Quiz",
    description: "Test knowledge with answers",
    icon: (
      <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M9 11h6" />
        <path d="M12 15h3" />
        <path d="M10 7H8" />
        <rect width="18" height="18" x="3" y="3" rx="2" />
      </svg>
    ),
    color: "bg-indigo-50 border-indigo-200",
  },
  {
    id: "image-choice",
    title: "Image Choice",
    description: "Choose from images",
    icon: (
      <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    ),
    color: "bg-pink-50 border-pink-200",
  },
  {
    id: "points-allocation",
    title: "100 Points",
    description: "Distribute points among options",
    icon: (
      <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="8" cy="8" r="6" />
        <path d="M18.09 10.37A6 6 0 1 1 10.37 18.09" />
        <path d="M7 6h1v4" />
        <path d="m16.71 13.88.7.71-2.82 2.82" />
      </svg>
    ),
    color: "bg-orange-50 border-orange-200",
  },
]

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Interactive Poll Types Available</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {pollTypes.map((pollType) => (
          <Card key={pollType.id} className={`${pollType.color} hover:shadow-md transition-shadow`}>
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-3">{pollType.icon}</div>
              <h3 className="font-medium text-sm mb-1">{pollType.title}</h3>
              <p className="text-xs text-muted-foreground">{pollType.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
