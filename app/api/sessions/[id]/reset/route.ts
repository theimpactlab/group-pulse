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

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const { searchParams } = new URL(request.url)
    const pollId = searchParams.get("pollId")

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

    // Delete responses for the session or specific poll
    let deleteQuery = supabaseAdmin.from("responses").delete()

    if (pollId) {
      // Delete responses for a specific poll
      deleteQuery = deleteQuery.eq("session_id", id).eq("poll_id", pollId)
    } else {
      // Delete all responses for the session
      deleteQuery = deleteQuery.eq("session_id", id)
    }

    const { error: deleteError } = await deleteQuery

    if (deleteError) {
      console.error("Error deleting responses:", deleteError)
      return NextResponse.json({ message: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: pollId ? "Poll responses reset successfully" : "All session responses reset successfully",
    })
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ message: error.message || "Failed to reset responses" }, { status: 500 })
  }
}

