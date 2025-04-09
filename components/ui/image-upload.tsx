"use client"

import React, { useState, useRef, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, X } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  existingImageUrl?: string
  className?: string
}

export function ImageUpload({ onImageUploaded, existingImageUrl, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingImageUrl || null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB")
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      // Create a local preview
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append("file", file)

      // Upload using our API route
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Failed to upload image")
      }

      const data = await response.json()

      // Call the callback with the new image URL
      onImageUploaded(data.url)
    } catch (err: any) {
      console.error("Error uploading image:", err)
      setError(err.message || "Failed to upload image. Please try again.")

      // Reset preview if upload failed
      if (existingImageUrl) {
        setPreviewUrl(existingImageUrl)
      } else {
        setPreviewUrl(null)
      }
    } finally {
      setIsUploading(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    onImageUploaded("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={className}>
      {previewUrl ? (
        <div className="relative border rounded-md overflow-hidden">
          <div className="aspect-video relative">
            <Image
              src={previewUrl || "/placeholder.svg"}
              alt="Preview"
              fill
              className="object-contain"
              onError={() => {
                setPreviewUrl("/placeholder.svg?height=200&width=300")
              }}
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border border-dashed rounded-md p-6 text-center">
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full h-32 flex flex-col gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-6 w-6" />
                <span>Upload Image</span>
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">Supported formats: JPG, PNG, GIF. Max size: 5MB</p>
        </div>
      )}
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  )
}
