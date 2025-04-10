"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { type Theme, defaultThemes } from "@/types/theme-types"
import { supabase } from "@/lib/supabase"
import { useSession } from "next-auth/react"
import { v4 as uuidv4 } from "uuid"
import { toast } from "sonner"

interface ThemeContextType {
  themes: Theme[]
  currentTheme: Theme
  setCurrentTheme: (theme: Theme) => void
  saveTheme: (theme: Theme) => Promise<Theme>
  deleteTheme: (themeId: string) => Promise<void>
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [themes, setThemes] = useState<Theme[]>(defaultThemes)
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultThemes[0])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Always set default themes even if not logged in
    setThemes(defaultThemes)
    setCurrentTheme(defaultThemes[0])

    if (session?.user?.id) {
      fetchThemes()
    } else {
      setIsLoading(false)
    }
  }, [session?.user?.id])

  const fetchThemes = async () => {
    setIsLoading(true)
    try {
      // First check if the themes table exists by trying to select from it
      const { error: tableCheckError } = await supabase.from("themes").select("id").limit(1).maybeSingle()

      if (tableCheckError) {
        console.error("Themes table may not exist or is not accessible:", tableCheckError)
        // If table doesn't exist or is not accessible, just use default themes
        setThemes(defaultThemes)
        setIsLoading(false)
        return
      }

      // Fetch user's custom themes
      const { data: userThemes, error: userThemesError } = await supabase
        .from("themes")
        .select("*")
        .eq("user_id", session?.user?.id)

      if (userThemesError) {
        console.error("Error fetching user themes:", userThemesError)
        setThemes(defaultThemes)
        setIsLoading(false)
        return
      }

      // Map database themes to our Theme interface
      const dbThemes = (userThemes || []).map((theme) => ({
        id: theme.id,
        name: theme.name,
        description: theme.description,
        colors: theme.colors as any,
        font: theme.font as any,
        borderRadius: theme.border_radius || "0.5rem",
        isDefault: false,
        userId: theme.user_id,
        createdAt: theme.created_at,
        updatedAt: theme.updated_at,
      }))

      // Combine default themes with user themes, ensuring no duplicates
      const combinedThemes = [...defaultThemes]

      // Add user themes that don't conflict with default themes
      dbThemes.forEach((theme) => {
        if (!combinedThemes.some((t) => t.id === theme.id)) {
          combinedThemes.push(theme)
        }
      })

      setThemes(combinedThemes)
    } catch (error) {
      console.error("Error fetching themes:", error)
      // If there's an error, just use default themes
      setThemes(defaultThemes)
    } finally {
      setIsLoading(false)
    }
  }

  const saveTheme = async (theme: Theme): Promise<Theme> => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to save themes")
      throw new Error("User must be logged in to save themes")
    }

    const themeToSave = {
      ...theme,
      id: theme.id || uuidv4(),
      userId: session.user.id,
      createdAt: theme.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    try {
      const { data, error } = await supabase
        .from("themes")
        .upsert({
          id: themeToSave.id,
          name: themeToSave.name,
          description: themeToSave.description,
          colors: themeToSave.colors,
          font: themeToSave.font,
          border_radius:
            typeof themeToSave.borderRadius === "number" ? themeToSave.borderRadius : themeToSave.borderRadius,
          is_default: false,
          user_id: session.user.id,
          created_at: themeToSave.createdAt,
          updated_at: themeToSave.updatedAt,
        })
        .select()

      if (error) throw error

      // Refresh themes list
      await fetchThemes()
      return themeToSave
    } catch (error) {
      console.error("Error saving theme:", error)
      throw error
    }
  }

  const deleteTheme = async (themeId: string) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to delete themes")
      throw new Error("User must be logged in to delete themes")
    }

    // Don't allow deleting default themes
    const isDefaultTheme = defaultThemes.some((theme) => theme.id === themeId)
    if (isDefaultTheme) {
      toast.error("Cannot delete default themes")
      throw new Error("Cannot delete default themes")
    }

    try {
      const { error } = await supabase.from("themes").delete().eq("id", themeId).eq("user_id", session.user.id)

      if (error) throw error

      // If the deleted theme was the current theme, switch to default
      if (currentTheme.id === themeId) {
        setCurrentTheme(defaultThemes[0])
      }

      // Refresh themes list
      await fetchThemes()
    } catch (error) {
      console.error("Error deleting theme:", error)
      throw error
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        themes,
        currentTheme,
        setCurrentTheme,
        saveTheme,
        deleteTheme,
        isLoading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
