"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { ThemeEditor } from "@/components/theme-editor"
import { useTheme } from "@/contexts/theme-context"
import { toast } from "sonner"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function EditThemePage() {
  const router = useRouter()
  const params = useParams()
  const { themes, saveTheme, isLoading } = useTheme()
  const [theme, setTheme] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isLoading && themes.length > 0) {
      const foundTheme = themes.find((t) => t.id === params.id)
      if (foundTheme) {
        setTheme(foundTheme)
      } else {
        toast.error("Theme not found")
        router.push("/settings/themes")
      }
    }
  }, [isLoading, themes, params.id, router])

  const handleSave = async (updatedTheme: any) => {
    setIsSaving(true)
    try {
      await saveTheme(updatedTheme)
      toast.success("Theme updated successfully")
      router.push("/settings/themes")
    } catch (error: any) {
      toast.error(error.message || "Failed to update theme")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || !theme) {
    return (
      <main className="flex-1 container py-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  return (
    <main className="flex-1 container py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Edit Theme: {theme.name}</h1>
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
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/settings/themes/edit/${params.id}`}>Edit</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ThemeEditor initialTheme={theme} onSave={handleSave} onCancel={() => router.push("/settings/themes")} />
    </main>
  )
}
