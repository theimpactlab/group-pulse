"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { type Theme, defaultThemes } from "@/types/theme-types"

interface ThemeWrapperProps {
  sessionId: string
  children: React.ReactNode
}

export function ThemeWrapper({ sessionId, children }: ThemeWrapperProps) {
  const [theme, setTheme] = useState<Theme | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSessionTheme() {
      try {
        // Fetch the session to get the theme_id
        const { data: sessionData, error: sessionError } = await supabase
          .from("sessions")
          .select("theme_id")
          .eq("id", sessionId)
          .single()

        if (sessionError) throw sessionError

        if (!sessionData?.theme_id) {
          // Use default theme if no theme is set
          setTheme(defaultThemes[0])
          setIsLoading(false)
          return
        }

        // Fetch the theme
        const { data: themeData, error: themeError } = await supabase
          .from("themes")
          .select("*")
          .eq("id", sessionData.theme_id)
          .single()

        if (themeError) {
          // If theme not found, use default
          setTheme(defaultThemes[0])
        } else {
          setTheme({
            ...themeData,
            colors: themeData.colors as any,
            font: themeData.font as any,
          })
        }
      } catch (error) {
        console.error("Error fetching theme:", error)
        // Fallback to default theme
        setTheme(defaultThemes[0])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessionTheme()
  }, [sessionId])

  if (isLoading || !theme) {
    // Return children without theme while loading
    return <>{children}</>
  }

  // Create CSS variables for the theme
  const cssVariables = {
    "--theme-primary": theme.colors.primary,
    "--theme-secondary": theme.colors.secondary,
    "--theme-accent": theme.colors.accent,
    "--theme-background": theme.colors.background,
    "--theme-foreground": theme.colors.foreground,
    "--theme-muted": theme.colors.muted,
    "--theme-muted-foreground": theme.colors.mutedForeground,
    "--theme-border": theme.colors.border,
    "--theme-radius": theme.borderRadius || "0.5rem",
    "--theme-font-heading": theme.font.heading,
    "--theme-font-body": theme.font.body,
  } as React.CSSProperties

  return (
    <div
      style={{
        ...cssVariables,
        fontFamily: "var(--theme-font-body)",
        backgroundColor: "var(--theme-background)",
        color: "var(--theme-foreground)",
      }}
    >
      {children}
    </div>
  )
}
