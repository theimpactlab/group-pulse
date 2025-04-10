"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { QrCode, Download, Share2 } from "lucide-react"
import { toast } from "sonner"
import QRCode from "qrcode.react"

interface QRCodeButtonProps {
  url: string
  title: string
}

export function QRCodeButton({ url, title }: QRCodeButtonProps) {
  const [open, setOpen] = useState(false)

  const handleDownload = () => {
    const canvas = document.getElementById("qr-code") as HTMLCanvasElement
    if (!canvas) return

    const url = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.href = url
    link.download = `${title.replace(/\s+/g, "-").toLowerCase()}-qr-code.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("QR code downloaded successfully")
  }

  const handleShare = async () => {
    try {
      if (!navigator.share) {
        toast.error("Sharing not supported on your browser")
        return
      }

      await navigator.share({
        title: `Join ${title}`,
        text: `Join the interactive session: ${title}`,
        url: url,
      })

      toast.success("Link shared successfully")
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <QrCode className="h-4 w-4" />
          <span className="hidden sm:inline">QR Code</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Session QR Code</DialogTitle>
          <DialogDescription>Scan this QR code with a mobile device to join the session.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4">
          <div className="bg-white p-4 rounded-lg">
            <QRCode id="qr-code" value={url} size={200} level="H" includeMargin renderAs="canvas" />
          </div>
          <p className="text-sm text-center mt-4 text-muted-foreground break-all">{url}</p>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleDownload} variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button onClick={handleShare} variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
