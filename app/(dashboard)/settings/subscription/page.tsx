"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle2, CreditCard, Info } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function SubscriptionPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Load PayPal SDK and initialize the button
  useEffect(() => {
    if (status === "authenticated") {
      setIsLoading(false)

      // Only load the PayPal script if it hasn't been loaded already
      if (!document.querySelector('script[src*="paypal.com/sdk/js"]')) {
        const script = document.createElement("script")
        script.src =
          "https://www.paypal.com/sdk/js?client-id=AX_8QiXsmnhX9jBZoE-iwUiJo3ZG78HFTvfV7GVOhsVvMTleSF6-lbLgrsBQ9qbXqrsHizT1GghTC36f&vault=true&intent=subscription"
        script.setAttribute("data-sdk-integration-source", "button-factory")
        script.addEventListener("load", () => {
          if (window.paypal) {
            window.paypal
              .Buttons({
                style: {
                  shape: "pill",
                  color: "black",
                  layout: "vertical",
                  label: "subscribe",
                },
                createSubscription: (data: any, actions: any) =>
                  actions.subscription.create({
                    plan_id: "P-33031622G52172046M72EPJY",
                  }),
                onApprove: (data: any, actions: any) => {
                  toast.success("Subscription successful!")
                  // Redirect to dashboard or refresh the page
                  setTimeout(() => {
                    router.refresh()
                  }, 1500)
                },
              })
              .render("#paypal-button-container-subscription-page")
          }
        })
        document.body.appendChild(script)
      } else if (
        window.paypal &&
        document.getElementById("paypal-button-container-subscription-page")?.children.length === 0
      ) {
        // If script is already loaded but button isn't rendered yet
        window.paypal
          .Buttons({
            style: {
              shape: "pill",
              color: "black",
              layout: "vertical",
              label: "subscribe",
            },
            createSubscription: (data: any, actions: any) =>
              actions.subscription.create({
                plan_id: "P-33031622G52172046M72EPJY",
              }),
            onApprove: (data: any, actions: any) => {
              toast.success("Subscription successful!")
              // Redirect to dashboard or refresh the page
              setTimeout(() => {
                router.refresh()
              }, 1500)
            },
          })
          .render("#paypal-button-container-subscription-page")
      }
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const handleManageSubscription = () => {
    setIsRedirecting(true)
    toast.info("Redirecting to PayPal to manage your subscription...")

    setTimeout(() => {
      // This URL would be your actual PayPal subscription management URL
      window.location.href = "https://www.paypal.com/myaccount/autopay/"
    }, 1500)
  }

  if (isLoading) {
    return (
      <div className="container py-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Subscription</h1>

      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/settings/subscription">Subscription</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Subscription Management</CardTitle>
              <CardDescription>Manage your GroupPulse subscription through PayPal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Subscription through PayPal</AlertTitle>
                <AlertDescription>
                  Your GroupPulse subscription is managed through PayPal. To check your current status, make changes, or
                  cancel, please visit your PayPal account.
                </AlertDescription>
              </Alert>

              <div className="pt-4">
                <Button
                  onClick={handleManageSubscription}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  disabled={isRedirecting}
                >
                  {isRedirecting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Redirecting...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" /> Manage Existing Subscription
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  View, modify or cancel your current subscription
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Standard Plan</CardTitle>
              <CardDescription>Get full access to all features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>30 day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Unlimited interactive sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>All poll types</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Unlimited participants per session</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Advanced analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Custom branding</span>
              </div>

              <div className="pt-4">
                <p className="font-medium">£3.50 per month</p>
                <p className="text-sm text-muted-foreground">Cancel anytime through PayPal</p>
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full rounded-md bg-white p-4">
                <div id="paypal-button-container-subscription-page" />
              </div>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>Questions about your subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                If you're having trouble with your subscription or have questions about billing, please contact our
                support team.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <a href="mailto:support@grouppulse.com">Contact Support</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
