"use client"

import { useState, useEffect } from "react"
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
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [canShare, setCanShare] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if Web Share API is available
    setCanShare(!!navigator.share)

    // Generate QR code using a free API service
    if (open) {
      setIsLoading(true)
      // Encode the URL for the API
      const encodedUrl = encodeURIComponent(url)
      // Use Google Charts API to generate QR code
      const qrApiUrl = `https://chart.googleapis.com/chart?cht=qr&chl=${encodedUrl}&chs=300x300&choe=UTF-8&chld=L|2`
      setQrCodeUrl(qrApiUrl)
      setIsLoading(false)
    }
  }, [url, open])

  const downloadQRCode = () => {
    try {
      // Create a link element
      const link = document.createElement("a")
      link.href = qrCodeUrl
      link.download = `${title.replace(/\s+/g, "-").toLowerCase()}-qr-code.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

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

      // Fetch the QR code image
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()

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
            {isLoading ? (
              <div className="w-[300px] h-[300px] flex items-center justify-center bg-gray-100">
                <span>Loading QR code...</span>
              </div>
            ) : (
              <img
                src={qrCodeUrl || "/placeholder.svg"}
                alt={`QR Code for ${url}`}
                width={300}
                height={300}
                className="max-w-full h-auto"
              />
            )}
          </div>
          <p className="text-sm text-center mt-4 text-muted-foreground break-all">{url}</p>
          <div className="flex gap-2 mt-4">
            <Button onClick={downloadQRCode} variant="outline" size="sm" className="gap-2" disabled={isLoading}>
              <Download className="h-4 w-4" />
              Download
            </Button>
            {canShare && (
              <Button onClick={shareQRCode} variant="outline" size="sm" className="gap-2" disabled={isLoading}>
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
