import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin } from "lucide-react"

export function ContactSection() {
  return (
    <section id="contact" className="py-16 md:py-24 bg-gray-50">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Get in touch</h2>
          <p className="text-lg text-muted-foreground">
            Have questions about GroupPulse? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a
                      href="mailto:ryan@theimpactlab.co.uk"
                      className="text-muted-foreground hover:text-primary"
                    >
                      ryan@theimpactlab.co.uk
                    </a>
                  </div>
                </div>
                <div className="flex items-start">
                  <div>
                    <p className="font-medium"></p>
                    <a
                      href=""
                      className="text-muted-foreground hover:text-primary"
                    >
                      
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Business Hours</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
