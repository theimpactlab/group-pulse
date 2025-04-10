"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle2, ExternalLink, CreditCard, Info } from "lucide-react"
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

  // Since we don't store subscription data in Supabase, we'll use a simpler approach
  // In a real implementation, you might want to check with PayPal's API for the actual status

  useEffect(() => {
    // Just check if the user is authenticated
    if (status === "authenticated") {
      setIsLoading(false)
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const handleSubscribe = () => {
    setIsRedirecting(true)
    // In a real implementation, this would redirect to PayPal checkout
    // For now, we'll simulate with a timeout
    toast.info("Redirecting to PayPal checkout...")

    setTimeout(() => {
      // This URL would be your actual PayPal checkout URL
      window.location.href = "https://www.paypal.com/subscriptions/checkout"
    }, 1500)
  }

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
                <span>Unlimited interactive sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>All poll types</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Up to 100 participants per session</span>
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
                <p className="font-medium">£4.95 per month</p>
                <p className="text-sm text-muted-foreground">Cancel anytime through PayPal</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSubscribe}
                className="w-full flex items-center justify-center gap-2"
                disabled={isRedirecting}
              >
                {isRedirecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Redirecting to PayPal...
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4" /> Subscribe via PayPal
                  </>
                )}
              </Button>
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
                <a href="mailto:ryan@theimpactlab.co.uk">Contact Support</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
