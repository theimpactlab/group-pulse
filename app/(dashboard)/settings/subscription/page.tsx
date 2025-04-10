"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format, addDays } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2, Calendar, CreditCard } from "lucide-react"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
// Add the import for the breadcrumb component at the top of the file
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
  const [profileData, setProfileData] = useState<any>(null)
  const [isUpgrading, setIsUpgrading] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user?.id) return

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("subscription_tier, trial_start_date, subscription_end_date, is_trial_expired")
          .eq("id", session.user.id)
          .single()

        if (error) throw error

        setProfileData(data)
      } catch (err) {
        console.error("Error fetching profile:", err)
        toast.error("Failed to load subscription information")
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchProfile()
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [session, status, router])

  const handleUpgrade = async () => {
    setIsUpgrading(true)

    // In a real implementation, this would redirect to a payment processor
    // For this example, we'll simulate a successful upgrade

    try {
      // Update the user's subscription tier
      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_tier: "standard",
          subscription_end_date: addDays(new Date(), 30).toISOString(), // Set next billing date
          is_trial_expired: false,
        })
        .eq("id", session?.user?.id)

      if (error) throw error

      toast.success("Successfully upgraded to Standard plan!")

      // Refresh the profile data
      const { data: updatedProfile, error: profileError } = await supabase
        .from("profiles")
        .select("subscription_tier, trial_start_date, subscription_end_date, is_trial_expired")
        .eq("id", session?.user?.id)
        .single()

      if (profileError) throw profileError

      setProfileData(updatedProfile)
    } catch (err) {
      console.error("Error upgrading subscription:", err)
      toast.error("Failed to upgrade subscription. Please try again.")
    } finally {
      setIsUpgrading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const isTrialActive = profileData?.subscription_tier === "free_trial" && !profileData?.is_trial_expired
  const isTrialExpired = profileData?.subscription_tier === "free_trial" && profileData?.is_trial_expired
  const isPaidSubscription = profileData?.subscription_tier === "standard"

  const daysLeft = isTrialActive
    ? Math.max(
        0,
        Math.ceil(
          (new Date(profileData.subscription_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
        ),
      )
    : 0

  const formattedEndDate = profileData?.subscription_end_date
    ? format(new Date(profileData.subscription_end_date), "MMMM d, yyyy")
    : "N/A"

  return (
    // Add breadcrumbs to the subscription page for better navigation

    // Find the main content section and add breadcrumbs after the title
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
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>Your current subscription details</CardDescription>
                </div>
                {isTrialActive && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                    Trial Active
                  </Badge>
                )}
                {isTrialExpired && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                    Trial Expired
                  </Badge>
                )}
                {isPaidSubscription && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                    Active
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">
                  {isTrialActive && "Free Trial"}
                  {isTrialExpired && "Free Trial (Expired)"}
                  {isPaidSubscription && "Standard Plan"}
                </h3>

                {isTrialActive && (
                  <p className="text-muted-foreground">
                    Your free trial gives you access to basic features for 30 days.
                  </p>
                )}

                {isTrialExpired && (
                  <p className="text-muted-foreground">
                    Your free trial has expired. Upgrade to continue using all features.
                  </p>
                )}

                {isPaidSubscription && (
                  <p className="text-muted-foreground">
                    You have access to all standard features including unlimited sessions.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {isTrialActive && (
                  <span>
                    Trial ends on {formattedEndDate} ({daysLeft} days left)
                  </span>
                )}
                {isTrialExpired && <span>Trial ended on {formattedEndDate}</span>}
                {isPaidSubscription && <span>Next billing date: {formattedEndDate}</span>}
              </div>

              {isPaidSubscription && (
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>£4.95 per month</span>
                </div>
              )}
            </CardContent>

            {isTrialExpired && (
              <CardFooter>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Limited Access</AlertTitle>
                  <AlertDescription>
                    Your trial has expired. Some features are now limited or unavailable.
                  </AlertDescription>
                </Alert>
              </CardFooter>
            )}
          </Card>

          {(isTrialActive || isTrialExpired) && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Upgrade to Standard</CardTitle>
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
                  <p className="text-sm text-muted-foreground">Cancel anytime</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleUpgrade} disabled={isUpgrading} className="w-full">
                  {isUpgrading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    "Upgrade Now"
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>Your recent invoices and payments</CardDescription>
            </CardHeader>
            <CardContent>
              {isPaidSubscription ? (
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Standard Plan - Monthly</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(profileData.subscription_end_date), "MMMM d, yyyy")}
                        </p>
                      </div>
                      <p className="font-medium">£4.95</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No billing history available.</p>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Manage your payment details</CardDescription>
            </CardHeader>
            <CardContent>
              {isPaidSubscription ? (
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 p-2 rounded">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/25</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No payment method on file.</p>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" disabled={!isPaidSubscription}>
                {isPaidSubscription ? "Update Payment Method" : "Add Payment Method"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
