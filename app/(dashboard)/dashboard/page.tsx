import { Card, CardContent } from "@/components/ui/card"
import {
  BarChart3,
  CloudRain,
  MessageSquare,
  Scale,
  SlidersHorizontal,
  ListOrdered,
  HelpCircle,
  BrainCircuit,
  ImageIcon,
  CircleDollarSign,
} from "lucide-react"

const pollTypes = [
  {
    id: "multiple-choice",
    name: "Multiple Choice",
    description: "Let your audience choose from options you define. Great for gauging opinions or testing knowledge.",
    icon: BarChart3,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    id: "word-cloud",
    name: "Word Cloud",
    description: "Collect words or short phrases that form a visually appealing cloud based on frequency.",
    icon: CloudRain,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
  },
  {
    id: "open-ended",
    name: "Open-ended Questions",
    description: "Gather detailed text responses for qualitative feedback and insights.",
    icon: MessageSquare,
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    id: "scale",
    name: "Scale",
    description: "Ask participants to rate something on a numeric scale, perfect for satisfaction surveys.",
    icon: Scale,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
  },
  {
    id: "slider",
    name: "Slider",
    description: "Position responses on a spectrum between two options, ideal for measuring sentiment.",
    icon: SlidersHorizontal,
    color: "text-teal-500",
    bgColor: "bg-teal-50",
  },
  {
    id: "ranking",
    name: "Ranking",
    description: "Have participants rank items in order of preference or importance.",
    icon: ListOrdered,
    color: "text-red-500",
    bgColor: "bg-red-50",
  },
  {
    id: "qa",
    name: "Q&A Session",
    description: "Allow participants to ask questions and upvote others' questions.",
    icon: HelpCircle,
    color: "text-cyan-500",
    bgColor: "bg-cyan-50",
  },
  {
    id: "quiz",
    name: "Quiz",
    description: "Test knowledge with questions that have correct answers and scoring.",
    icon: BrainCircuit,
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
  },
  {
    id: "image-choice",
    name: "Image Choice",
    description: "Let participants choose between different images or visual options.",
    icon: ImageIcon,
    color: "text-pink-500",
    bgColor: "bg-pink-50",
  },
  {
    id: "points-allocation",
    name: "100 Points",
    description: "Let participants distribute a fixed number of points among different options.",
    icon: CircleDollarSign,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
  },
]

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Interactive Poll Types Available</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {pollTypes.map((pollType) => (
          <Card key={pollType.id} className={`${pollType.bgColor} hover:shadow-md transition-shadow`}>
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-3">
                <pollType.icon className={`w-8 h-8 ${pollType.color}`} />
              </div>
              <h3 className="font-medium text-sm mb-1">{pollType.name}</h3>
              <p className="text-xs text-muted-foreground">{pollType.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
