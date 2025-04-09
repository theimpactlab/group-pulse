"use client"

import { useState, useEffect } from "react"

type ColorScheme = "light" | "dark"

export function useColorScheme() {
  // Always default to light mode
  const [colorScheme, setColorScheme] = useState<ColorScheme>("light")

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return

    // Create the media query but don't use it for initial state
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    // Define the handler
    const handleChange = (e: MediaQueryListEvent) => {
      // Uncomment this if you want to allow system preference to change the theme
      // setColorScheme(e.matches ? "dark" : "light")

      // For now, always use light mode
      setColorScheme("light")
    }

    // Add the listener
    mediaQuery.addEventListener("change", handleChange)

    // Clean up
    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  return colorScheme
}
