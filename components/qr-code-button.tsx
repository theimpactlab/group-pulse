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

interface QRCodeButtonProps {
  url: string
  title: string
}

export function QRCodeButton({ url, title }: QRCodeButtonProps) {
  const [open, setOpen] = useState(false)
  const [canShare, setCanShare] = useState(typeof navigator !== "undefined" && !!navigator.share)

  // Use QR Server API - a reliable QR code generation service
  const getQrCodeUrl = () => {
    const encodedUrl = encodeURIComponent(url)
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUrl}`
  }

  const downloadQRCode = async () => {
    try {
      const qrCodeUrl = getQrCodeUrl()

      // Fetch the image
      const response = await fetch(qrCodeUrl)
      if (!response.ok) throw new Error("Failed to fetch QR code")

      const blob = await response.blob()

      // Create a download link
      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = `${title.replace(/\s+/g, "-").toLowerCase()}-qr-code.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up
      URL.revokeObjectURL(downloadUrl)

      toast.success("QR code downloaded successfully")
    } catch (error) {
      console.error("Error downloading QR code:", error)
      toast.error("Failed to download QR code")
    }
  }

  const shareQRCode = async () => {
    try {
      if (!navigator.share) {
        toast.error("Web Share API is not supported in your browser")
        return
      }

      // Try to share just the URL first (most compatible)
      try {
        await navigator.share({
          title: `Join ${title}`,
          text: `Join the interactive session: ${title}`,
          url: url,
        })
        toast.success("Link shared successfully")
        return
      } catch (error) {
        console.error("Error sharing link:", error)
        // Fall through to try sharing with image
      }

      // If sharing just the URL fails, try with the image
      const qrCodeUrl = getQrCodeUrl()
      const response = await fetch(qrCodeUrl)
      if (!response.ok) throw new Error("Failed to fetch QR code")

      const blob = await response.blob()
      const file = new File([blob], `${title.replace(/\s+/g, "-").toLowerCase()}-qr-code.png`, {
        type: "image/png",
      })

      await navigator.share({
        title: `Join ${title}`,
        text: `Scan this QR code to join the session: ${title}`,
        url: url,
        files: [file],
      })

      toast.success("QR code shared successfully")
    } catch (error) {
      console.error("Error sharing QR code:", error)
      toast.error("Failed to share QR code")
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
            {open && (
              <img
                src={getQrCodeUrl() || "/placeholder.svg"}
                alt={`QR Code for ${url}`}
                width={300}
                height={300}
                className="max-w-full h-auto"
                onError={(e) => {
                  console.error("Error loading QR code image")
                  ;(e.target as HTMLImageElement).src = "/qr-code-glitch.png"
                }}
              />
            )}
          </div>
          <p className="text-sm text-center mt-4 text-muted-foreground break-all">{url}</p>
          <div className="flex gap-2 mt-4">
            <Button onClick={downloadQRCode} variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
            {canShare && (
              <Button onClick={shareQRCode} variant="outline" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
