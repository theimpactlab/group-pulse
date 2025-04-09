import Image from "next/image"
import { LandingNav } from "@/components/landing-nav"
import { LandingFooter } from "@/components/landing-footer"

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Ryan Miemczyk",
      role: "Co-Founder",
      bio: "Research Psychologist with an interest in human decision making.",
      image: "https://www.trustimpact.com/wp-content/uploads/2022/05/Ryan-Miemszyk.png",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gray-50">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">About GroupPulse</h1>
              <p className="text-xl text-muted-foreground">
                We're on a mission to transform how people interact during presentations, meetings, and events.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                <p className="mb-4">
                  Group-Pulse was born out of frustration. As collaborators and organizers, we
                  experienced firsthand the challenge of keeping audiences engaged during presentations and meetings.
                </p>
                <p className="mb-4">
                  In 2023, we decided to create a solution that would bridge the gap
                  between presenters and their audiences, making every session more interactive, engaging, and valuable
                  for everyone involved.
                </p>
                <p>
                  What started as a simple polling tool has evolved into a comprehensive platform for real-time audience
                  engagement, used by thousands of educators, corporate trainers, and event organizers worldwide.
                </p>
              </div>
              <div className="relative h-[400px] rounded-lg overflow-hidden">
                <Image
                  src="https://theimpactlab.co.uk/images/IMPACTLABLOGO2.png?height=800&width=600"
                  alt="GroupPulse founders"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-16 bg-gray-50">
          <div className="container">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-4">Engagement First</h3>
                <p>
                  We believe that true learning and collaboration happen when everyone is actively engaged. Every
                  feature we build is designed to increase participation and meaningful interaction.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-4">Inclusive Design</h3>
                <p>
                  We're committed to creating tools that work for everyone, regardless of technical ability, device, or
                  accessibility needs. Our platform is designed to be intuitive and accessible to all.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-4">Data-Driven Insights</h3>
                <p>
                  We help presenters go beyond gut feelings by providing meaningful analytics and insights that can
                  improve future sessions and drive better outcomes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16">
          <div className="container">
            <h2 className="text-3xl font-bold mb-12 text-center">Meet Our Team</h2>
            <div
              className={`${
                teamMembers.length === 1
                  ? "flex justify-center"
                  : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              }`}
            >
              {teamMembers.map((member, index) => (
                <div key={index} className="text-center">
                  <div className="relative h-64 w-64 mx-auto rounded-full overflow-hidden mb-4">
                    <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
                  </div>
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-primary mb-2">{member.role}</p>
                  <p className="text-muted-foreground">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  )
}
