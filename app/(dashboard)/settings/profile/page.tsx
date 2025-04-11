"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save, User, KeyRound } from "lucide-react"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { PasswordChangeForm } from "@/components/password-change-form"
import { AvatarUpload } from "@/components/avatar-upload"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [profileData, setProfileData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("info")

  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user?.id) return

      try {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        if (error) throw error

        setProfileData(data)
        setName(data.name || session.user.name || "")
        setEmail(session.user.email || "")
      } catch (err) {
        console.error("Error fetching profile:", err)
        toast({
          title: "Error",
          description: "Failed to load profile information",
          variant: "destructive",
        })
        // Still set the name and email from session as fallback
        setName(session.user.name || "")
        setEmail(session.user.email || "")
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchProfile()
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [session, status, router, toast])

  const handleSaveProfile = async () => {
    if (!session?.user?.id) return

    setIsSaving(true)

    try {
      // Update the profile in Supabase
      const { error } = await supabase
        .from("profiles")
        .update({
          name: name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.user.id)

      if (error) throw error

      // Update the session to reflect the changes
      await update({
        ...session,
        user: {
          ...session.user,
          name: name,
        },
      })

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully",
      })
    } catch (err) {
      console.error("Error updating profile:", err)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarChange = async (url: string) => {
    if (!session?.user?.id) return

    try {
      // Update the profile in Supabase
      const { error } = await supabase
        .from("profiles")
        .update({
          avatar_url: url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.user.id)

      if (error) throw error

      // Update the session to reflect the changes
      await update({
        ...session,
        user: {
          ...session.user,
          image: url,
        },
      })

      // Update local state
      setProfileData({
        ...profileData,
        avatar_url: url,
      })

      return Promise.resolve()
    } catch (err) {
      console.error("Error updating avatar:", err)
      return Promise.reject(err)
    }
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
        <h1 className="text-3xl font-bold">Profile</h1>
      </div>

      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/settings/profile">Profile</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="max-w-3xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Personal Info</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                  <div className="flex flex-col items-center">
                    <AvatarUpload
                      userId={session?.user?.id || ""}
                      initialAvatarUrl={profileData?.avatar_url || session?.user?.image}
                      onAvatarChange={handleAvatarChange}
                      size="lg"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Click to change avatar</p>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={email} disabled className="bg-muted" />
                      <p className="text-xs text-muted-foreground">Email address cannot be changed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent>
                <PasswordChangeForm email={email} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
