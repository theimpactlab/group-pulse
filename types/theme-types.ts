export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  mutedForeground: string
  border: string
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
  borderRadius?: string
  isDefault?: boolean
  createdAt: string
  updatedAt: string
  userId: string
}

export const defaultThemes: Theme[] = [
  {
    id: "default",
    name: "Default",
    description: "The default GroupPulse theme",
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
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "system",
  },
  {
    id: "dark",
    name: "Dark Mode",
    description: "A dark theme for low-light environments",
    colors: {
      primary: "#818cf8",
      secondary: "#1f2937",
      accent: "#4f46e5",
      background: "#111827",
      foreground: "#f9fafb",
      muted: "#1f2937",
      mutedForeground: "#9ca3af",
      border: "#374151",
    },
    font: {
      heading: "Inter, sans-serif",
      body: "Inter, sans-serif",
    },
    borderRadius: "0.5rem",
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "system",
  },
  {
    id: "playful",
    name: "Playful",
    description: "A colorful and fun theme",
    colors: {
      primary: "#ec4899",
      secondary: "#f0abfc",
      accent: "#c084fc",
      background: "#ffffff",
      foreground: "#0f172a",
      muted: "#fce7f3",
      mutedForeground: "#6b7280",
      border: "#f9a8d4",
    },
    font: {
      heading: "Poppins, sans-serif",
      body: "Poppins, sans-serif",
    },
    borderRadius: "1rem",
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "system",
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "A professional theme for business presentations",
    colors: {
      primary: "#0ea5e9",
      secondary: "#e0f2fe",
      accent: "#0284c7",
      background: "#ffffff",
      foreground: "#0f172a",
      muted: "#f1f5f9",
      mutedForeground: "#64748b",
      border: "#cbd5e1",
    },
    font: {
      heading: "Montserrat, sans-serif",
      body: "Roboto, sans-serif",
    },
    borderRadius: "0.25rem",
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "system",
  },
]
