"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "@/contexts/theme-context"
import type { Theme } from "@/types/theme-types"
import { v4 as uuidv4 } from "uuid"
import { Loader2, Save, Trash2 } from "lucide-react"
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

interface ThemeEditorProps {
  initialTheme?: Theme
  onSave?: (theme: Theme) => void
  onCancel?: () => void
}

export function ThemeEditor({ initialTheme, onSave, onCancel }: ThemeEditorProps) {
  const { saveTheme, deleteTheme } = useTheme()
  const [theme, setTheme] = useState<Theme>(
    initialTheme || {
      id: uuidv4(),
      name: "New Theme",
      description: "",
      colors: {
        primary: "#6366f1",
        secondary: "#f3f4f6",
        accent: "#ede9fe",
        background: "#ffffff",
        foreground: "#0f172a",
        muted: "#f3f4f6",
        mutedForeground: "#6b7280",
        border: "#e5e7eb",
      },
      font: {
        heading: "Inter, sans-serif",
        body: "Inter, sans-serif",
      },
      borderRadius: "0.5rem",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "",
    },
  )
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState("colors")

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // If onSave is provided, use it, otherwise use the context's saveTheme
      if (onSave) {
        onSave(theme)
      } else {
        const savedTheme = await saveTheme(theme)
        toast.success("Theme saved successfully")
      }
    } catch (error: any) {
      console.error("Error saving theme:", error)
      toast.error(error.message || "Failed to save theme")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!theme.id) return

    setIsDeleting(true)
    try {
      await deleteTheme(theme.id)
      toast.success("Theme deleted successfully")
      if (onCancel) {
        onCancel()
      }
    } catch (error: any) {
      console.error("Error deleting theme:", error)
      toast.error(error.message || "Failed to delete theme")
    } finally {
      setIsDeleting(false)
    }
  }

  const updateThemeColor = (key: keyof Theme["colors"], value: string) => {
    setTheme({
      ...theme,
      colors: {
        ...theme.colors,
        [key]: value,
      },
    })
  }

  const updateThemeFont = (key: keyof Theme["font"], value: string) => {
    setTheme({
      ...theme,
      font: {
        ...theme.font,
        [key]: value,
      },
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Theme Editor</CardTitle>
        <CardDescription>Customize the look and feel of your sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="theme-name">Theme Name</Label>
            <Input
              id="theme-name"
              value={theme.name}
              onChange={(e) => setTheme({ ...theme, name: e.target.value })}
              placeholder="Enter theme name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="theme-description">Description (Optional)</Label>
            <Textarea
              id="theme-description"
              value={theme.description || ""}
              onChange={(e) => setTheme({ ...theme, description: e.target.value })}
              placeholder="Enter theme description"
              rows={2}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: theme.colors.primary }}></div>
                  <Input
                    id="primary-color"
                    type="text"
                    value={theme.colors.primary}
                    onChange={(e) => updateThemeColor("primary", e.target.value)}
                  />
                  <Input
                    type="color"
                    value={theme.colors.primary}
                    onChange={(e) => updateThemeColor("primary", e.target.value)}
                    className="w-10 p-1 h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary-color">Secondary Color</Label>
                <div className="flex gap-2">
                  <div
                    className="w-10 h-10 rounded-md border"
                    style={{ backgroundColor: theme.colors.secondary }}
                  ></div>
                  <Input
                    id="secondary-color"
                    type="text"
                    value={theme.colors.secondary}
                    onChange={(e) => updateThemeColor("secondary", e.target.value)}
                  />
                  <Input
                    type="color"
                    value={theme.colors.secondary}
                    onChange={(e) => updateThemeColor("secondary", e.target.value)}
                    className="w-10 p-1 h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accent-color">Accent Color</Label>
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: theme.colors.accent }}></div>
                  <Input
                    id="accent-color"
                    type="text"
                    value={theme.colors.accent}
                    onChange={(e) => updateThemeColor("accent", e.target.value)}
                  />
                  <Input
                    type="color"
                    value={theme.colors.accent}
                    onChange={(e) => updateThemeColor("accent", e.target.value)}
                    className="w-10 p-1 h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="background-color">Background Color</Label>
                <div className="flex gap-2">
                  <div
                    className="w-10 h-10 rounded-md border"
                    style={{ backgroundColor: theme.colors.background }}
                  ></div>
                  <Input
                    id="background-color"
                    type="text"
                    value={theme.colors.background}
                    onChange={(e) => updateThemeColor("background", e.target.value)}
                  />
                  <Input
                    type="color"
                    value={theme.colors.background}
                    onChange={(e) => updateThemeColor("background", e.target.value)}
                    className="w-10 p-1 h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="foreground-color">Text Color</Label>
                <div className="flex gap-2">
                  <div
                    className="w-10 h-10 rounded-md border"
                    style={{ backgroundColor: theme.colors.foreground }}
                  ></div>
                  <Input
                    id="foreground-color"
                    type="text"
                    value={theme.colors.foreground}
                    onChange={(e) => updateThemeColor("foreground", e.target.value)}
                  />
                  <Input
                    type="color"
                    value={theme.colors.foreground}
                    onChange={(e) => updateThemeColor("foreground", e.target.value)}
                    className="w-10 p-1 h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="border-color">Border Color</Label>
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: theme.colors.border }}></div>
                  <Input
                    id="border-color"
                    type="text"
                    value={theme.colors.border}
                    onChange={(e) => updateThemeColor("border", e.target.value)}
                  />
                  <Input
                    type="color"
                    value={theme.colors.border}
                    onChange={(e) => updateThemeColor("border", e.target.value)}
                    className="w-10 p-1 h-10"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="typography" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="heading-font">Heading Font</Label>
                <select
                  id="heading-font"
                  className="w-full p-2 border rounded-md"
                  value={theme.font.heading}
                  onChange={(e) => updateThemeFont("heading", e.target.value)}
                >
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="Roboto, sans-serif">Roboto</option>
                  <option value="Poppins, sans-serif">Poppins</option>
                  <option value="Montserrat, sans-serif">Montserrat</option>
                  <option value="Open Sans, sans-serif">Open Sans</option>
                  <option value="Lato, sans-serif">Lato</option>
                  <option value="Playfair Display, serif">Playfair Display</option>
                  <option value="Merriweather, serif">Merriweather</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="body-font">Body Font</Label>
                <select
                  id="body-font"
                  className="w-full p-2 border rounded-md"
                  value={theme.font.body}
                  onChange={(e) => updateThemeFont("body", e.target.value)}
                >
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="Roboto, sans-serif">Roboto</option>
                  <option value="Poppins, sans-serif">Poppins</option>
                  <option value="Montserrat, sans-serif">Montserrat</option>
                  <option value="Open Sans, sans-serif">Open Sans</option>
                  <option value="Lato, sans-serif">Lato</option>
                  <option value="Source Sans Pro, sans-serif">Source Sans Pro</option>
                  <option value="Nunito, sans-serif">Nunito</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="border-radius">Border Radius</Label>
                <Input
                  id="border-radius"
                  type="text"
                  value={theme.borderRadius || "0.5rem"}
                  onChange={(e) => setTheme({ ...theme, borderRadius: e.target.value })}
                  placeholder="0.5rem"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div
              className="p-6 rounded-lg border"
              style={{
                backgroundColor: theme.colors.background,
                color: theme.colors.foreground,
                borderColor: theme.colors.border,
                borderRadius: theme.borderRadius,
              }}
            >
              <h2
                style={{
                  fontFamily: theme.font.heading,
                  color: theme.colors.foreground,
                }}
                className="text-2xl font-bold mb-4"
              >
                Theme Preview
              </h2>
              <p
                style={{
                  fontFamily: theme.font.body,
                  color: theme.colors.foreground,
                }}
                className="mb-4"
              >
                This is how your theme will look in presentations. The text and background colors are applied to create
                a cohesive design.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: "#ffffff",
                    borderRadius: theme.borderRadius,
                  }}
                  className="p-4"
                >
                  <h3 style={{ fontFamily: theme.font.heading }} className="font-bold mb-2">
                    Primary Button
                  </h3>
                  <p style={{ fontFamily: theme.font.body }}>This is your primary color</p>
                </div>

                <div
                  style={{
                    backgroundColor: theme.colors.secondary,
                    color: theme.colors.foreground,
                    borderRadius: theme.borderRadius,
                  }}
                  className="p-4"
                >
                  <h3 style={{ fontFamily: theme.font.heading }} className="font-bold mb-2">
                    Secondary Button
                  </h3>
                  <p style={{ fontFamily: theme.font.body }}>This is your secondary color</p>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: theme.colors.accent,
                  color: theme.colors.foreground,
                  borderRadius: theme.borderRadius,
                }}
                className="p-4 mb-4"
              >
                <h3 style={{ fontFamily: theme.font.heading }} className="font-bold mb-2">
                  Accent Section
                </h3>
                <p style={{ fontFamily: theme.font.body }}>
                  This section uses your accent color for highlighting important information.
                </p>
              </div>

              <div
                style={{
                  backgroundColor: theme.colors.muted,
                  color: theme.colors.mutedForeground,
                  borderRadius: theme.borderRadius,
                  padding: "1rem",
                }}
              >
                <p style={{ fontFamily: theme.font.body }}>This is muted text on a muted background.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          {initialTheme && !initialTheme.isDefault && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your theme.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Theme
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
