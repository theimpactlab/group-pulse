import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"


export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get the form data with the file
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ message: "File must be an image" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: "File size must be less than 5MB" }, { status: 400 })
    }

    // Generate a unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `${fileName}`

    // Convert the file to an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    console.log("Uploading file to Supabase Storage...")
    console.log("Bucket: images")
    console.log("File path:", filePath)

    // Ensure the "images" bucket exists (create if it doesn't)
    const { data: buckets } = await getSupabaseAdmin().storage.listBuckets()
    const imagesBucket = buckets?.find((b) => b.name === "images")
    if (!imagesBucket) {
      console.log("Creating 'images' storage bucket...")
      const { error: createBucketError } = await getSupabaseAdmin().storage.createBucket("images", {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
      })
      if (createBucketError) {
        console.error("Error creating bucket:", createBucketError)
        return NextResponse.json({ message: "Failed to initialize storage: " + createBucketError.message }, { status: 500 })
      }
    }

    // Upload to Supabase Storage using admin privileges
    const { data, error: uploadError } = await getSupabaseAdmin().storage.from("images").upload(filePath, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return NextResponse.json({ message: uploadError.message }, { status: 500 })
    }

    // Get the public URL
    const { data: publicUrlData } = getSupabaseAdmin().storage.from("images").getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
    })
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ message: error.message || "Failed to upload image" }, { status: 500 })
  }
}
