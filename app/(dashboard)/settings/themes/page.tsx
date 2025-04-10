"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LockIcon, CrownIcon } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"

export default function ThemesPage() {
  const router = useRouter()

  return (
    <main className="flex-1 container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Themes</h1>
      </div>

      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/settings/themes">Themes</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Custom Themes</CardTitle>
              <CardDescription>Create and manage custom themes for your presentations</CardDescription>
            </div>
            <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
              <CrownIcon className="h-4 w-4 mr-1" />
              Enterprise Feature
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 opacity-50">
              {/* Default theme card */}
              <Card>
                <div className="h-2 bg-blue-500" />
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Default</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Active</span>
                  </CardTitle>
                  <CardDescription>The default GroupPulse theme</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <div className="w-6 h-6 rounded-full border bg-blue-500" title="Primary" />
                    <div className="w-6 h-6 rounded-full border bg-gray-200" title="Secondary" />
                    <div className="w-6 h-6 rounded-full border bg-blue-100" title="Accent" />
                    <div className="w-6 h-6 rounded-full border bg-white" title="Background" />
                    <div className="w-6 h-6 rounded-full border bg-gray-900" title="Foreground" />
                  </div>
                </CardContent>
              </Card>

              {/* Dark theme card */}
              <Card>
                <div className="h-2 bg-indigo-500" />
                <CardHeader>
                  <CardTitle>Dark Mode</CardTitle>
                  <CardDescription>A dark theme for low-light environments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <div className="w-6 h-6 rounded-full border bg-indigo-500" title="Primary" />
                    <div className="w-6 h-6 rounded-full border bg-gray-800" title="Secondary" />
                    <div className="w-6 h-6 rounded-full border bg-indigo-900" title="Accent" />
                    <div className="w-6 h-6 rounded-full border bg-gray-900" title="Background" />
                    <div className="w-6 h-6 rounded-full border bg-gray-100" title="Foreground" />
                  </div>
                </CardContent>
              </Card>

              {/* Add theme card */}
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-full py-8">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <LockIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="font-medium text-gray-500 mb-2">Create Custom Theme</h3>
                  <p className="text-sm text-gray-400 text-center mb-4">
                    Create your own custom themes with the Enterprise plan
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Overlay with upgrade button */}
            <div className="absolute inset-0 bg-gray-100/50 backdrop-blur-[1px] flex flex-col items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md">
                <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LockIcon className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Enterprise Feature</h3>
                <p className="text-gray-600 mb-6">
                  Custom themes are available exclusively with our Enterprise plan. Upgrade now to create and manage
                  personalized themes for your presentations.
                </p>
                <Button asChild>
                  <Link href="/settings/subscription">Upgrade to Enterprise</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Themes</CardTitle>
          <CardDescription>These themes are available on all plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <div className="h-2 bg-blue-500" />
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Default</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Active</span>
                </CardTitle>
                <CardDescription>The default GroupPulse theme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <div className="w-6 h-6 rounded-full border bg-blue-500" title="Primary" />
                  <div className="w-6 h-6 rounded-full border bg-gray-200" title="Secondary" />
                  <div className="w-6 h-6 rounded-full border bg-blue-100" title="Accent" />
                  <div className="w-6 h-6 rounded-full border bg-white" title="Background" />
                  <div className="w-6 h-6 rounded-full border bg-gray-900" title="Foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <div className="h-2 bg-indigo-500" />
              <CardHeader>
                <CardTitle>Dark Mode</CardTitle>
                <CardDescription>A dark theme for low-light environments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <div className="w-6 h-6 rounded-full border bg-indigo-500" title="Primary" />
                  <div className="w-6 h-6 rounded-full border bg-gray-800" title="Secondary" />
                  <div className="w-6 h-6 rounded-full border bg-indigo-900" title="Accent" />
                  <div className="w-6 h-6 rounded-full border bg-gray-900" title="Background" />
                  <div className="w-6 h-6 rounded-full border bg-gray-100" title="Foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
