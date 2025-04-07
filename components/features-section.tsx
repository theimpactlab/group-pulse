import { BarChart3, MessageSquare, Users, Zap, Globe, Lock, BarChart, LineChart } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      name: "Interactive Polls",
      description:
        "Create engaging multiple-choice polls, word clouds, scales, and more to capture audience feedback in real-time.",
      icon: BarChart3,
    },
    {
      name: "Q&A Sessions",
      description: "Allow participants to ask questions and vote on the most important ones to address.",
      icon: MessageSquare,
    },
    {
      name: "Unlimited Participants",
      description: "Scale to any audience size with our robust platform that handles thousands of concurrent users.",
      icon: Users,
    },
    {
      name: "Real-time Results",
      description: "See responses as they come in with beautiful, automatically updating visualizations.",
      icon: Zap,
    },
    {
      name: "Accessible Anywhere",
      description: "Participants can join from any device with a web browser - no downloads or installations required.",
      icon: Globe,
    },
    {
      name: "Secure & Private",
      description: "Enterprise-grade security ensures your data and your participants' information stays protected.",
      icon: Lock,
    },
    {
      name: "Comprehensive Analytics",
      description: "Gain insights from detailed reports and export data for further analysis.",
      icon: BarChart,
    },
    {
      name: "Custom Branding",
      description: "Add your logo, colors, and styling to create a seamless branded experience.",
      icon: LineChart,
    },
  ]

  return (
    <section id="features" className="py-16 md:py-24 bg-gray-50">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Powerful features for engaging your audience
          </h2>
          <p className="text-lg text-muted-foreground">
            GroupPulse provides all the tools you need to create interactive and memorable presentations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.name} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">{feature.name}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

