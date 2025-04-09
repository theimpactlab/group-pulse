"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function PricingSection() {
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://www.paypal.com/sdk/js?client-id=AX_8QiXsmnhX9jBZoE-iwUiJo3ZG78HFTvfV7GVOhsVvMTleSF6-lbLgrsBQ9qbXqrsHizT1GghTC36f&vault=true&intent=subscription"
    script.setAttribute("data-sdk-integration-source", "button-factory")
    script.addEventListener("load", () => {
      if (window.paypal) {
        window.paypal.Buttons({
          style: {
            shape: "pill",
            color: "black", // you can try "silver", "white", "blue", or "black"
            layout: "vertical",
            label: "subscribe"
          },
          createSubscription: function (data: any, actions: any) {
            return actions.subscription.create({
              plan_id: "P-33031622G52172046M72EPJY"
            })
          },
          onApprove: function (data: any, actions: any) {
            window.location.href = "/register"
          }
        }).render("#paypal-button-container-P-33031622G52172046M72EPJY")
      }
    })
    document.body.appendChild(script)
  }, [])

  return (
    <section id="pricing" className="py-16 md:py-24">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Simple, transparent pricing</h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that's right for you and start engaging with your audience today.
          </p>
        </div>

       <div className="grid md:grid-cols-2 gap-8 justify-items-center">
          {/* Standard Plan */}
          <Card className="w-full max-w-sm border-2 border-primary relative">
            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
              Popular
            </div>
            <CardHeader>
              <CardTitle className="text-xl">Standard</CardTitle>
              <div className="mt-4 flex items-baseline text-3xl font-bold">
                £3.50
                <span className="ml-1 text-sm font-medium text-muted-foreground">/month</span>
              </div>
              <CardDescription>Perfect for individuals and small teams</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-2 shrink-0" /><span>30 day free trial</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-2 shrink-0" /><span>Unlimited interactive sessions</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-2 shrink-0" /><span>All poll types</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-2 shrink-0" /><span>Unlimited participants per session</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-2 shrink-0" /><span>Advanced analytics</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-2 shrink-0" /><span>Custom branding</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-2 shrink-0" /><span>Priority email support</span></li>
              </ul>
            </CardContent>
              <CardFooter>
                <div className="w-full rounded-md bg-white p-4">
                  <div id="paypal-button-container-P-33031622G52172046M72EPJY" />
                </div>
              </CardFooter>
          </Card>

          {/* Enterprise Plan */}
          <Card className="w-full max-w-sm border-2 border-primary relative">
            <CardHeader>
              <CardTitle className="text-xl">Enterprise</CardTitle>
              <div className="mt-4 flex items-baseline text-3xl font-bold">POA</div>
              <CardDescription>For organizations with advanced needs</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-2 shrink-0" /><span>Everything in Standard</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-2 shrink-0" /><span>Unlimited participants</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-2 shrink-0" /><span>SSO authentication</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-2 shrink-0" /><span>Advanced security features</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-2 shrink-0" /><span>Dedicated account manager</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-2 shrink-0" /><span>24/7 phone & email support</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-2 shrink-0" /><span>Custom integrations</span></li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/contact" className="inline-block w-full text-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition">Contact Sales</Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  )
}
