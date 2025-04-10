"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { type Theme, defaultThemes } from "@/types/theme-types"
import { supabase } from "@/lib/supabase"
import { useSession } from "next-auth/react"
import { v4 as uuidv4 } from "uuid"

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
    if (session?.user?.id) {
      fetchThemes()
    } else {
      setIsLoading(false)
    }
  }, [session?.user?.id])

  const fetchThemes = async () => {
    setIsLoading(true)
    try {
      // Fetch user's custom themes
      const { data: userThemes, error } = await supabase.from("themes").select("*").eq("user_id", session?.user?.id)

      if (error) throw error

      // Combine default themes with user themes
      const allThemes = [
        ...defaultThemes,
        ...(userThemes?.map((theme) => ({
          ...theme,
          colors: theme.colors as any,
          font: theme.font as any,
        })) || []),
      ]

      setThemes(allThemes)
    } catch (error) {
      console.error("Error fetching themes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveTheme = async (theme: Theme): Promise<Theme> => {
    if (!session?.user?.id) {
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
          border_radius: themeToSave.borderRadius,
          is_default: false,
          user_id: themeToSave.userId,
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
      throw new Error("User must be logged in to delete themes")
    }

    // Don't allow deleting default themes
    const isDefaultTheme = defaultThemes.some((theme) => theme.id === themeId)
    if (isDefaultTheme) {
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
