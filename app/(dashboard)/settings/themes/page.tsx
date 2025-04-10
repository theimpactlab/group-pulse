"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Pencil } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function ThemesPage() {
  const router = useRouter()
  const { themes, deleteTheme, isLoading } = useTheme()
  const [deletingThemeId, setDeletingThemeId] = useState<string | null>(null)

  const handleDeleteTheme = async (themeId: string) => {
    try {
      setDeletingThemeId(themeId)
      await deleteTheme(themeId)
      toast.success("Theme deleted successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to delete theme")
    } finally {
      setDeletingThemeId(null)
    }
  }

  return (
    <main className="flex-1 container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Themes</h1>
        <Button onClick={() => router.push("/settings/themes/create")}>
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme) => (
          <Card key={theme.id} className="overflow-hidden">
            <div className="h-2" style={{ backgroundColor: theme.colors.primary }} />
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{theme.name}</span>
                {theme.isDefault && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Default</span>
                )}
              </CardTitle>
              <CardDescription>{theme.description || "No description"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(theme.colors)
                  .slice(0, 5)
                  .map(([key, color]) => (
                    <div
                      key={key}
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: color }}
                      title={key}
                    />
                  ))}
                {Object.keys(theme.colors).length > 5 && (
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                    +{Object.keys(theme.colors).length - 5}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/settings/themes/edit/${theme.id}`)}
                disabled={theme.isDefault}
              >
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </Button>

              {!theme.isDefault && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-500">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the theme.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteTheme(theme.id)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        {deletingThemeId === theme.id ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  )
}
