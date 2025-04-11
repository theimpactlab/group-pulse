"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, KeyRound, Bell, CreditCard, ArrowRight, Palette, Crown } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const router = useRouter()

  const settingsCategories = [
    {
      title: "Profile",
      description: "Manage your personal information and avatar",
      icon: User,
      href: "/settings/profile",
      color: "text-blue-500",
    },
    {
      title: "Security",
      description: "Update your password and security settings",
      icon: KeyRound,
      href: "/settings/security",
      color: "text-red-500",
      highlight: true,
    },
    {
      title: "Notifications",
      description: "Configure how you receive notifications",
      icon: Bell,
      href: "/settings/notifications",
      color: "text-amber-500",
    },
    {
      title: "Subscription",
      description: "Manage your subscription plan and billing",
      icon: CreditCard,
      href: "/settings/subscription",
      color: "text-green-500",
    },
    {
      title: "Themes",
      description: "Customize and manage your presentation themes",
      icon: Palette,
      href: "/settings/themes",
      color: "text-purple-500",
      enterprise: true,
    },
  ]

  return (
    <main className="flex-1 container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 max-w-4xl">
        {settingsCategories.map((category) => (
          <Card
            key={category.title}
            className={`hover:shadow-md transition-shadow ${category.highlight ? "border-primary border-2" : ""}`}
          >
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className={`p-2 rounded-full bg-gray-100 ${category.color}`}>
                <category.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle>{category.title}</CardTitle>
                  {category.enterprise && (
                    <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium flex items-center">
                      <Crown className="h-3 w-3 mr-1" /> Enterprise
                    </span>
                  )}
                </div>
                <CardDescription>{category.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {category.title === "Security" && (
                <div className="text-sm text-muted-foreground mb-4">
                  <p>• Change your password</p>
                  <p>• Manage account security</p>
                </div>
              )}
              {category.title === "Notifications" && (
                <div className="text-sm text-muted-foreground mb-4">
                  <p>• Email notification preferences</p>
                  <p>• Push notification settings</p>
                </div>
              )}
              {category.title === "Themes" && (
                <div className="text-sm text-muted-foreground mb-4">
                  <p>• Create custom themes</p>
                  <p>• Manage your theme library</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full justify-between">
                <Link href={category.href}>
                  Go to {category.title} <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  )
}
