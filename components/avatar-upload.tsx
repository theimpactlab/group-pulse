"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Camera } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

interface AvatarUploadProps {
  userId: string
  initialAvatarUrl?: string | null
  onAvatarChange: (url: string) => Promise<void>
  size?: "sm" | "md" | "lg"
}

export function AvatarUpload({ userId, initialAvatarUrl, onAvatarChange, size = "md" }: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl || null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
  }

  const uploadAvatar = async (file: File) => {
    if (!userId) return

    setIsUploading(true)
    setError(null)

    try {
      // Create a unique file name
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}-${uuidv4()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get the public URL
      const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(filePath)
      const publicUrl = publicUrlData.publicUrl

      // Update state
      setAvatarUrl(publicUrl)

      // Call the callback
      await onAvatarChange(publicUrl)

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully",
      })
    } catch (err: any) {
      console.error("Error uploading avatar:", err)
      setError(err.message || "Failed to upload avatar")
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: err.message || "Failed to upload avatar",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.)",
      })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Image size should be less than 2MB")
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Image size should be less than 2MB",
      })
      return
    }

    uploadAvatar(file)
  }

  const handleRemoveAvatar = async () => {
    if (!avatarUrl) return

    try {
      // Call the callback with empty string to remove avatar
      await onAvatarChange("")
      setAvatarUrl(null)
      toast({
        title: "Avatar removed",
        description: "Your profile picture has been removed",
      })
    } catch (err: any) {
      console.error("Error removing avatar:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to remove avatar",
      })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <Avatar className={`${sizeClasses[size]} border-2 border-background`}>
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt="Profile" />
          ) : (
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userId.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>

        <label
          htmlFor="avatar-upload"
          className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
        >
          <Camera className="h-6 w-6" />
          <span className="sr-only">Upload avatar</span>
        </label>

        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
      </div>

      {avatarUrl && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemoveAvatar}
          className="mt-2 text-xs text-muted-foreground hover:text-destructive"
        >
          Remove
        </Button>
      )}

      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </div>
  )
}
