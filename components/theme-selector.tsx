"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useTheme } from "@/contexts/theme-context"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface ThemeSelectorProps {
  selectedThemeId: string
  onSelect: (theme: any) => void
}

export function ThemeSelector({ selectedThemeId, onSelect }: ThemeSelectorProps) {
  const { themes, isLoading } = useTheme()
  const [open, setOpen] = useState(false)

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />
  }

  const selectedTheme = themes.find((theme) => theme.id === selectedThemeId) || themes[0]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedTheme.colors.primary }} />
            {selectedTheme.name}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search themes..." />
          <CommandList>
            <CommandEmpty>No themes found.</CommandEmpty>
            <CommandGroup>
              {themes.map((theme) => (
                <CommandItem
                  key={theme.id}
                  value={theme.name}
                  onSelect={() => {
                    onSelect(theme)
                    setOpen(false)
                  }}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                    <span>{theme.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {theme.isDefault ? "Default" : "Custom"}
                    </span>
                  </div>
                  <Check
                    className={cn("ml-auto h-4 w-4", selectedThemeId === theme.id ? "opacity-100" : "opacity-0")}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
