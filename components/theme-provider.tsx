"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Force light theme as default to ensure consistency
  return (
    <NextThemesProvider forcedTheme="light" {...props}>
      {children}
    </NextThemesProvider>
  )
}
