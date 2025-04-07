"use client"

import { useState, useEffect } from "react"

type ColorScheme = "light" | "dark"

export function useColorScheme() {
  // Initialize with the current color scheme
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    // Check if window is defined (client-side)
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    return "light" // Default to light on server
  })

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return

    // Create the media query
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    // Define the handler
    const handleChange = (e: MediaQueryListEvent) => {
      setColorScheme(e.matches ? "dark" : "light")
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

