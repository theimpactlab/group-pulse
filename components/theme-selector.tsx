"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/contexts/theme-context"
import type { Theme } from "@/types/theme-types"
import { Palette, ChevronDown, Plus, Pencil } from "lucide-react"
import { ThemeEditor } from "@/components/theme-editor"

interface ThemeSelectorProps {
  onSelect?: (theme: Theme) => void
  selectedThemeId?: string
}

export function ThemeSelector({ onSelect, selectedThemeId }: ThemeSelectorProps) {
  const { themes, currentTheme, setCurrentTheme } = useTheme()
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingTheme, setEditingTheme] = useState<Theme | undefined>(undefined)

  const handleSelectTheme = (theme: Theme) => {
    setCurrentTheme(theme)
    if (onSelect) {
      onSelect(theme)
    }
  }

  const handleEditTheme = (theme: Theme) => {
    setEditingTheme(theme)
    setIsEditorOpen(true)
  }

  const handleCreateTheme = () => {
    setEditingTheme(undefined)
    setIsEditorOpen(true)
  }

  const handleSaveTheme = (theme: Theme) => {
    setCurrentTheme(theme)
    if (onSelect) {
      onSelect(theme)
    }
    setIsEditorOpen(false)
  }

  const selectedTheme = selectedThemeId ? themes.find((t) => t.id === selectedThemeId) || currentTheme : currentTheme

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center">
              <Palette className="mr-2 h-4 w-4" />
              <span>{selectedTheme.name}</span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Select Theme</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {themes.map((theme) => (
            <DropdownMenuItem key={theme.id} onClick={() => handleSelectTheme(theme)} className="flex justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: theme.colors.primary }}></div>
                <span>{theme.name}</span>
              </div>
              {!theme.isDefault && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditTheme(theme)
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCreateTheme}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Create New Theme</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editingTheme ? "Edit Theme" : "Create New Theme"}</DialogTitle>
            <DialogDescription>
              {editingTheme ? "Modify your existing theme" : "Create a new custom theme for your sessions"}
            </DialogDescription>
          </DialogHeader>
          <ThemeEditor initialTheme={editingTheme} onSave={handleSaveTheme} onCancel={() => setIsEditorOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
