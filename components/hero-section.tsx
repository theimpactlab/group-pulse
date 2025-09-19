import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
            Engage your audience in real-time
          </h1>
          <p className="text-xl text-muted-foreground mb-8 md:mb-12">
            Create interactive polls, quizzes, and Q&As that captivate your audience and provide valuable insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/#pricing">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/#features">See Features</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
