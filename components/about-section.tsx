import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function AboutSection() {
  return (
    <section id="about" className="py-16 md:py-24">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">About GroupPulse</h2>
            <p className="text-lg text-muted-foreground mb-6">
              We're on a mission to transform how people interact during presentations, meetings, and events.
            </p>
            <p className="mb-6">
              GroupPulse was founded in 2025 by a group of consultants working in the charity sector who were
              frustrated with the lack of engagement in traditional presentations and meetings.
            </p>
            <p className="mb-6">
              Our platform enables presenters to create interactive experiences that capture attention, gather valuable
              feedback, and make every participant feel heard and involved.
            </p>
            <p className="mb-8">
              Today, GroupPulse is used by thousands of educators, corporate trainers, event organizers, and team
              leaders around the world to create more engaging and productive sessions.
            </p>
            <Button asChild>
              <Link href="/about">Learn More About Us</Link>
            </Button>
          </div>
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <Image
              src="https://ourimpact.co.uk/templaces/IMPACT_LAB_LOGO.png?height=800&width=600"
              alt="theimpactlab"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

