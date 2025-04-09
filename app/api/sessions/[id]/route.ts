import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Create a Supabase client with the service role key for admin access
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Helper function to check if a URL is from Supabase Storage
function isSupabaseStorageUrl(url: string): boolean {
  if (!url) return false

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return false

  // Check if the URL contains the Supabase URL and storage path
  return url.includes(supabaseUrl) && url.includes("/storage/v1/object/public/")
}

// Helper function to extract file path from Supabase Storage URL
function extractFilePathFromUrl(url: string): string | null {
  if (!url) return null

  try {
    // Extract the path after "public/"
    const match = url.match(/\/storage\/v1\/object\/public\/([^?]+)/)
    if (match && match[1]) {
      return match[1]
    }
    return null
  } catch (error) {
    console.error("Error extracting file path:", error)
    return null
  }
}

// Helper function to clean up images associated with a session
async function cleanupSessionImages(sessionContent: any[]): Promise<void> {
  try {
    if (!sessionContent || !Array.isArray(sessionContent)) return

    // Collect all image URLs from the session content
    const imageUrls: string[] = []

    sessionContent.forEach((item) => {
      if (item.type === "image-choice" && item.data && item.data.options) {
        item.data.options.forEach((option: any) => {
          if (option.imageUrl && isSupabaseStorageUrl(option.imageUrl)) {
            imageUrls.push(option.imageUrl)
          }
        })
      }
    })

    if (imageUrls.length === 0) return

    console.log(`Found ${imageUrls.length} images to delete`)

    // Delete each image from storage
    for (const url of imageUrls) {
      const filePath = extractFilePathFromUrl(url)
      if (filePath) {
        const [bucket, ...pathParts] = filePath.split("/")
        const path = pathParts.join("/")

        const { error } = await supabaseAdmin.storage.from(bucket).remove([path])
        if (error) {
          console.error(`Error deleting image ${path}:`, error)
        } else {
          console.log(`Successfully deleted image: ${path}`)
        }
      }
    }
  } catch (error) {
    console.error("Error cleaning up session images:", error)
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    if (!id) {
      return NextResponse.json({ message: "Session ID is required" }, { status: 400 })
    }

    // First verify that the session belongs to the current user and get its content
    const { data: sessionData, error: fetchError } = await supabaseAdmin
      .from("sessions")
      .select("user_id, content")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("Error fetching session:", fetchError)
      return NextResponse.json({ message: fetchError.message }, { status: 500 })
    }

    if (!sessionData) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 })
    }

    // Check if the session belongs to the current user
    if (sessionData.user_id !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    // Clean up any images associated with this session
    await cleanupSessionImages(sessionData.content || [])

    // Delete the session using admin privileges
    const { error: deleteError } = await supabaseAdmin.from("sessions").delete().eq("id", id)

    if (deleteError) {
      console.error("Error deleting session:", deleteError)
      return NextResponse.json({ message: deleteError.message }, { status: 500 })
    }

    // Return a simple success message as a string
    return NextResponse.json({ success: true, message: "Session deleted successfully" })
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ message: error.message || "Failed to delete session" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    if (!id) {
      return NextResponse.json({ message: "Session ID is required" }, { status: 400 })
    }

    // Parse the request body
    const body = await request.json()

    // First verify that the session belongs to the current user
    const { data: sessionData, error: fetchError } = await supabaseAdmin
      .from("sessions")
      .select("user_id")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("Error fetching session:", fetchError)
      return NextResponse.json({ message: fetchError.message }, { status: 500 })
    }

    if (!sessionData) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 })
    }

    // Check if the session belongs to the current user
    if (sessionData.user_id !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    // Update the session using admin privileges
    const { data, error: updateError } = await supabaseAdmin
      .from("sessions")
      .update({
        title: body.title,
        description: body.description,
        content: body.content,
      })
      .eq("id", id)
      .select()

    if (updateError) {
      console.error("Error updating session:", updateError)
      return NextResponse.json({ message: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Session updated successfully", data })
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ message: error.message || "Failed to update session" }, { status: 500 })
  }
}
