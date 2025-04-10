export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  mutedForeground: string
  border: string
  input: string
  ring: string
  success: string
  warning: string
  error: string
  card: string
  cardForeground: string
}

export interface ThemeFont {
  heading: string
  body: string
}

export interface Theme {
  id: string
  name: string
  description?: string
  colors: ThemeColors
  font: ThemeFont
  borderRadius: number
  isDefault?: boolean
  userId?: string
  createdAt?: string
  updatedAt?: string
}

// Default themes
export const defaultThemes: Theme[] = [
  {
    id: "default",
    name: "Default",
    description: "The default GroupPulse theme",
    isDefault: true,
    colors: {
      primary: "#6366f1",
      secondary: "#f43f5e",
      accent: "#22d3ee",
      background: "#ffffff",
      foreground: "#0f172a",
      muted: "#f1f5f9",
      mutedForeground: "#64748b",
      border: "#e2e8f0",
      input: "#e2e8f0",
      ring: "#6366f1",
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",
      card: "#ffffff",
      cardForeground: "#0f172a",
    },
    font: {
      heading: "Inter",
      body: "Inter",
    },
    borderRadius: 8,
  },
  {
    id: "dark",
    name: "Dark Mode",
    description: "A dark theme for low-light environments",
    isDefault: true,
    colors: {
      primary: "#818cf8",
      secondary: "#fb7185",
      accent: "#67e8f9",
      background: "#0f172a",
      foreground: "#f8fafc",
      muted: "#1e293b",
      mutedForeground: "#94a3b8",
      border: "#334155",
      input: "#334155",
      ring: "#818cf8",
      success: "#4ade80",
      warning: "#fbbf24",
      error: "#f87171",
      card: "#1e293b",
      cardForeground: "#f8fafc",
    },
    font: {
      heading: "Inter",
      body: "Inter",
    },
    borderRadius: 8,
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Professional theme for business presentations",
    isDefault: true,
    colors: {
      primary: "#0ea5e9",
      secondary: "#6366f1",
      accent: "#14b8a6",
      background: "#ffffff",
      foreground: "#0f172a",
      muted: "#f1f5f9",
      mutedForeground: "#64748b",
      border: "#e2e8f0",
      input: "#e2e8f0",
      ring: "#0ea5e9",
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",
      card: "#ffffff",
      cardForeground: "#0f172a",
    },
    font: {
      heading: "Montserrat",
      body: "Roboto",
    },
    borderRadius: 4,
  },
  {
    id: "playful",
    name: "Playful",
    description: "Fun and colorful theme for engaging presentations",
    isDefault: true,
    colors: {
      primary: "#8b5cf6",
      secondary: "#ec4899",
      accent: "#06b6d4",
      background: "#ffffff",
      foreground: "#18181b",
      muted: "#f4f4f5",
      mutedForeground: "#71717a",
      border: "#e4e4e7",
      input: "#e4e4e7",
      ring: "#8b5cf6",
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      card: "#ffffff",
      cardForeground: "#18181b",
    },
    font: {
      heading: "Poppins",
      body: "Poppins",
    },
    borderRadius: 12,
  },
]

// Helper function to convert theme to CSS variables
export function themeToCSS(theme: Theme): Record<string, string> {
  return {
    "--primary": theme.colors.primary,
    "--secondary": theme.colors.secondary,
    "--accent": theme.colors.accent,
    "--background": theme.colors.background,
    "--foreground": theme.colors.foreground,
    "--muted": theme.colors.muted,
    "--muted-foreground": theme.colors.mutedForeground,
    "--border": theme.colors.border,
    "--input": theme.colors.input,
    "--ring": theme.colors.ring,
    "--success": theme.colors.success,
    "--warning": theme.colors.warning,
    "--error": theme.colors.error,
    "--card": theme.colors.card,
    "--card-foreground": theme.colors.cardForeground,
    "--radius": `${theme.borderRadius}px`,
    "--font-heading": theme.font.heading,
    "--font-body": theme.font.body,
  }
}
