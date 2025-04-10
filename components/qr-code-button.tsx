"use client"

import { useState, useEffect, useRef } from "react"
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
import { QRCodeSVG } from "qrcode.react"

interface QRCodeButtonProps {
  url: string
  title: string
}

export function QRCodeButton({ url, title }: QRCodeButtonProps) {
  const [open, setOpen] = useState(false)
  const qrCodeRef = useRef<HTMLDivElement>(null)
  const [canShare, setCanShare] = useState(false)

  useEffect(() => {
    // Check if Web Share API is available
    setCanShare(!!navigator.share)
  }, [])

  const downloadQRCode = () => {
    try {
      // Create a canvas from the SVG
      const svgElement = qrCodeRef.current?.querySelector("svg")
      if (!svgElement) {
        toast.error("Could not find QR code to download")
        return
      }

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        toast.error("Could not create canvas context")
        return
      }

      // Set canvas dimensions
      canvas.width = 1000
      canvas.height = 1000

      // Create an image from the SVG
      const img = new Image()
      img.crossOrigin = "anonymous"
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
      const svgUrl = URL.createObjectURL(svgBlob)

      img.onload = () => {
        // Fill with white background
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw the image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // Convert to data URL and download
        const dataUrl = canvas.toDataURL("image/png")
        const link = document.createElement("a")
        link.href = dataUrl
        link.download = `${title.replace(/\s+/g, "-").toLowerCase()}-qr-code.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Clean up
        URL.revokeObjectURL(svgUrl)

        toast.success("QR code downloaded successfully")
      }

      img.src = svgUrl
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

      // Create a canvas from the SVG
      const svgElement = qrCodeRef.current?.querySelector("svg")
      if (!svgElement) {
        toast.error("Could not find QR code to share")
        return
      }

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        toast.error("Could not create canvas context")
        return
      }

      // Set canvas dimensions
      canvas.width = 1000
      canvas.height = 1000

      // Create an image from the SVG
      const img = new Image()
      img.crossOrigin = "anonymous"
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
      const svgUrl = URL.createObjectURL(svgBlob)

      img.onload = async () => {
        // Fill with white background
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw the image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // Convert to blob
        canvas.toBlob(async (blob) => {
          if (!blob) {
            toast.error("Failed to create image for sharing")
            return
          }

          // Create file from blob
          const file = new File([blob], `${title.replace(/\s+/g, "-").toLowerCase()}-qr-code.png`, {
            type: "image/png",
          })

          try {
            // Share the file and URL
            await navigator.share({
              title: `Join ${title}`,
              text: `Scan this QR code to join the session: ${title}`,
              url: url,
              files: [file],
            })
            toast.success("QR code shared successfully")
          } catch (shareError) {
            console.error("Error sharing:", shareError)

            // Fallback to just sharing the URL if file sharing fails
            try {
              await navigator.share({
                title: `Join ${title}`,
                text: `Join the interactive session: ${title}`,
                url: url,
              })
              toast.success("Link shared successfully")
            } catch (fallbackError) {
              console.error("Fallback sharing failed:", fallbackError)
              toast.error("Failed to share QR code")
            }
          }

          // Clean up
          URL.revokeObjectURL(svgUrl)
        }, "image/png")
      }

      img.src = svgUrl
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
          <div className="bg-white p-4 rounded-lg" ref={qrCodeRef}>
            <QRCodeSVG value={url} size={200} level="H" includeMargin={true} bgColor={"#ffffff"} fgColor={"#000000"} />
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
