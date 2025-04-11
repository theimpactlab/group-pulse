"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Loader2, Save, Mail, BellRing } from "lucide-react"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { NotificationPreferences } from "@/types/notification-types"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function NotificationsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_session_activity: true,
    email_responses: true,
    email_trial_updates: true,
    email_security: true,
    email_marketing: false,
    push_session_activity: true,
    push_responses: true,
    push_trial_updates: true,
    push_security: true,
  })

  useEffect(() => {
    async function fetchPreferences() {
      if (!session?.user?.id) return

      try {
        // In a real implementation, this would fetch from a notification_preferences table
        // For now, we'll use mock data
        setPreferences({
          email_session_activity: true,
          email_responses: true,
          email_trial_updates: true,
          email_security: true,
          email_marketing: false,
          push_session_activity: true,
          push_responses: true,
          push_trial_updates: true,
          push_security: true,
        })
      } catch (err) {
        console.error("Error fetching notification preferences:", err)
        toast({
          title: "Error",
          description: "Failed to load notification preferences",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchPreferences()
    }
  }, [session, toast])

  const handleSavePreferences = async () => {
    if (!session?.user?.id) return

    setIsSaving(true)

    try {
      // In a real implementation, this would update the database
      // For now, we'll just simulate a successful update
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been updated successfully",
      })
    } catch (err) {
      console.error("Error updating notification preferences:", err)
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  if (isLoading) {
    return (
      <main className="flex-1 container py-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  return (
    <main className="flex-1 container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Notification Settings</h1>
      </div>

      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/settings/notifications">Notifications</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="max-w-3xl">
        <Tabs defaultValue="email">
          <TabsList className="mb-4">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>Email Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="push" className="flex items-center gap-2">
              <BellRing className="h-4 w-4" />
              <span>Push Notifications</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Notification Preferences</CardTitle>
                <CardDescription>Choose which emails you'd like to receive from GroupPulse</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email_session_activity">Session Activity</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about your session creations and updates
                      </p>
                    </div>
                    <Switch
                      id="email_session_activity"
                      checked={preferences.email_session_activity}
                      onCheckedChange={(checked) => updatePreference("email_session_activity", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email_responses">Responses</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails when you get new responses to your sessions
                      </p>
                    </div>
                    <Switch
                      id="email_responses"
                      checked={preferences.email_responses}
                      onCheckedChange={(checked) => updatePreference("email_responses", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email_trial_updates">Trial & Subscription Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about your trial status and subscription updates
                      </p>
                    </div>
                    <Switch
                      id="email_trial_updates"
                      checked={preferences.email_trial_updates}
                      onCheckedChange={(checked) => updatePreference("email_trial_updates", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email_security">Security Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about security-related events (always on for critical alerts)
                      </p>
                    </div>
                    <Switch
                      id="email_security"
                      checked={preferences.email_security}
                      onCheckedChange={(checked) => updatePreference("email_security", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email_marketing">Marketing & Promotions</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about new features, tips, and special offers
                      </p>
                    </div>
                    <Switch
                      id="email_marketing"
                      checked={preferences.email_marketing}
                      onCheckedChange={(checked) => updatePreference("email_marketing", checked)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSavePreferences} disabled={isSaving} className="gap-2">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save Preferences
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="push">
            <Card>
              <CardHeader>
                <CardTitle>Push Notification Preferences</CardTitle>
                <CardDescription>Choose which browser notifications you'd like to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push_session_activity">Session Activity</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about your session creations and updates
                      </p>
                    </div>
                    <Switch
                      id="push_session_activity"
                      checked={preferences.push_session_activity}
                      onCheckedChange={(checked) => updatePreference("push_session_activity", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push_responses">Responses</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when you get new responses to your sessions
                      </p>
                    </div>
                    <Switch
                      id="push_responses"
                      checked={preferences.push_responses}
                      onCheckedChange={(checked) => updatePreference("push_responses", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push_trial_updates">Trial & Subscription Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about your trial status and subscription updates
                      </p>
                    </div>
                    <Switch
                      id="push_trial_updates"
                      checked={preferences.push_trial_updates}
                      onCheckedChange={(checked) => updatePreference("push_trial_updates", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push_security">Security Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about security-related events
                      </p>
                    </div>
                    <Switch
                      id="push_security"
                      checked={preferences.push_security}
                      onCheckedChange={(checked) => updatePreference("push_security", checked)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSavePreferences} disabled={isSaving} className="gap-2">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save Preferences
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
