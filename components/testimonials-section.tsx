import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "GroupPulse transformed our meetings. We now have great participation instead of the same few people speaking up every time.",
      author: "Helen Greig",
      title: "Managing Director, Trust Impact",
      avatar: "https://www.trustimpact.com/wp-content/uploads/2020/10/Helen-e1602144986128.jpg",
    },
    {
      quote:
        "As a university lecturer, I've seen student engagement skyrocket since implementing GroupPulse in my lectures.",
      author: "Dr. Clark Hobson",
      title: "Professor, University of Leicester",
      avatar:
        "https://cdn.theconversation.com/avatars/142598/width238/RackMultipart20141027-25275-bilfpf.jpg?height=100&width=100",
    },
    {
      quote:
        "The real-time analytics have given me the ability to engage everyone in data-driven decision making.",
      author: "Dr. Joanna Hook",
      title: "Consultant Psychiatrist",
      avatar: "https://www.trustimpact.com/wp-content/uploads/2024/02/Joie-Hook.jpg",
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Trusted by teams worldwide
          </h2>
          <p className="text-lg text-muted-foreground">
            See what our customers have to say about GroupPulse.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-2">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <blockquote className="text-lg mb-6 flex-grow">
                    {testimonial.quote}
                  </blockquote>
                  <div className="flex items-center">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
                      <Image
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={testimonial.author}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.title}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
