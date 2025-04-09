"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"

export function useThemeFix() {
  const { setTheme } = useTheme()

  useEffect(() => {
    // Force light theme on initial load to prevent flash of dark theme
    setTheme("light")

    // Optional: Add a class to the body to help with debugging
    document.body.classList.add("theme-fixed")
  }, [setTheme])

  return null
}
