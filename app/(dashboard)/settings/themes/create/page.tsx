"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
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

export default function CreateThemePage() {
  const router = useRouter()
  const { saveTheme } = useTheme()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (theme: any) => {
    setIsSaving(true)
    try {
      await saveTheme(theme)
      toast.success("Theme created successfully")
      router.push("/settings/themes")
    } catch (error: any) {
      toast.error(error.message || "Failed to create theme")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="flex-1 container py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Create New Theme</h1>
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
            <BreadcrumbLink href="/settings/themes/create">Create</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ThemeEditor onSave={handleSave} onCancel={() => router.push("/settings/themes")} />
    </main>
  )
}
