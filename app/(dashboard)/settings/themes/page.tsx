"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Palette } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTheme } from "@/contexts/theme-context"
import type { Theme } from "@/types/theme-types"
import { ThemeEditor } from "@/components/theme-editor"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function ThemesPage() {
  const router = useRouter()
  const { themes, isLoading } = useTheme()
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingTheme, setEditingTheme] = useState<Theme | undefined>(undefined)

  const handleEditTheme = (theme: Theme) => {
    setEditingTheme(theme)
    setIsEditorOpen(true)
  }

  const handleCreateTheme = () => {
    setEditingTheme(undefined)
    setIsEditorOpen(true)
  }

  const handleSaveTheme = () => {
    setIsEditorOpen(false)
  }

  return (
    <main className="flex-1 container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Theme Settings</h1>
        <Button onClick={handleCreateTheme}>
          <Plus className="mr-2 h-4 w-4" /> Create Theme
        </Button>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <Card
            key={theme.id}
            className={`cursor-pointer hover:shadow-md transition-shadow ${theme.isDefault ? "border-dashed" : ""}`}
            onClick={() => handleEditTheme(theme)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{theme.name}</CardTitle>
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: theme.colors.primary }}
                ></div>
              </div>
              <CardDescription>{theme.description || "No description"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(theme.colors)
                  .slice(0, 5)
                  .map(([key, color]) => (
                    <div
                      key={key}
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: color }}
                      title={key}
                    ></div>
                  ))}
              </div>
              <div className="text-xs text-muted-foreground flex items-center">
                <Palette className="h-3 w-3 mr-1" />
                {theme.isDefault ? "Default theme" : "Custom theme"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editingTheme ? "Edit Theme" : "Create New Theme"}</DialogTitle>
            <DialogDescription>
              {editingTheme ? "Modify your existing theme" : "Create a new custom theme for your sessions"}
            </DialogDescription>
          </DialogHeader>
          <ThemeEditor initialTheme={editingTheme} onSave={handleSaveTheme} onCancel={() => setIsEditorOpen(false)} />
        </DialogContent>
      </Dialog>
    </main>
  )
}
