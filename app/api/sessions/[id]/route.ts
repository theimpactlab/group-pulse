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

    // Delete the session using admin privileges
    const { error: deleteError } = await supabaseAdmin.from("sessions").delete().eq("id", id)

    if (deleteError) {
      console.error("Error deleting session:", deleteError)
      return NextResponse.json({ message: deleteError.message }, { status: 500 })
    }

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

