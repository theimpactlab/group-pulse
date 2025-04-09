"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
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
import { useToast } from "@/components/ui/use-toast"

interface QRCodeButtonProps {
  url: string
  title: string
}

export function QRCodeButton({ url, title }: QRCodeButtonProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const downloadQRCode = () => {
    try {
      // Create a canvas element
      const canvas = document.createElement("canvas")
      const svg = document.getElementById("qr-code")
      if (!svg) return

      const svgData = new XMLSerializer().serializeToString(svg)
      const img = new Image()

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        ctx.drawImage(img, 0, 0)

        // Download the canvas as an image
        const dataUrl = canvas.toDataURL("image/png")
        const link = document.createElement("a")
        link.href = dataUrl
        link.download = `${title.replace(/\s+/g, "-").toLowerCase()}-qr-code.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast({
          title: "QR Code downloaded",
          description: "The QR code has been downloaded to your device.",
        })
      }

      img.src = "data:image/svg+xml;base64," + btoa(svgData)
    } catch (error) {
      console.error("Error downloading QR code:", error)
      toast({
        title: "Download failed",
        description: "There was an error downloading the QR code.",
        variant: "destructive",
      })
    }
  }

  const shareQRCode = async () => {
    try {
      if (!navigator.share) {
        toast({
          title: "Sharing not supported",
          description: "Your browser doesn't support the Web Share API. Try downloading the QR code instead.",
          variant: "destructive",
        })
        return
      }

      await navigator.share({
        title: `QR Code for ${title}`,
        text: `Scan this QR code to join the session: ${title}`,
        url: url,
      })

      toast({
        title: "QR Code shared",
        description: "The QR code has been shared successfully.",
      })
    } catch (error) {
      console.error("Error sharing QR code:", error)
      toast({
        title: "Sharing failed",
        description: "There was an error sharing the QR code. Try downloading it instead.",
        variant: "destructive",
      })
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
            <QRCodeSVG id="qr-code" value={url} size={200} level="H" includeMargin />
          </div>
          <p className="text-sm text-center mt-4 text-muted-foreground break-all">{url}</p>
          <div className="flex gap-2 mt-4">
            <Button onClick={downloadQRCode} variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button onClick={shareQRCode} variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
