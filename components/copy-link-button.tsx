"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface CopyLinkButtonProps {
  url: string
}

export function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast({
        title: "Link copied",
        description: "The join link has been copied to your clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
      toast({
        title: "Copy failed",
        description: "Failed to copy the link. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Button onClick={copyToClipboard} variant="outline" size="sm" className="gap-2">
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      <span className="hidden sm:inline">Copy Link</span>
    </Button>
  )
}
