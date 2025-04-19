import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with the service role key for admin access
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ message: "Session ID is required" }, { status: 400 })
    }

    // First try to find by ID
    let { data: sessionData, error: fetchError } = await supabaseAdmin
      .from("sessions")
      .select("id, title, description, status, content, code")
      .eq("id", id)
      .single()

    // If not found by ID, try to find by code (if the ID is short enough to be a code)
    if (!sessionData && id.length <= 10) {
      const { data: codeData, error: codeError } = await supabaseAdmin
        .from("sessions")
        .select("id, title, description, status, content, code")
        .eq("code", id)
        .single()

      if (!codeError && codeData) {
        sessionData = codeData
      }
    }

    if (!sessionData) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 })
    }

    // Only return active sessions or sessions in draft mode
    if (sessionData.status !== "active" && sessionData.status !== "draft") {
      return NextResponse.json({ message: "Session is not active" }, { status: 403 })
    }

    return NextResponse.json(sessionData)
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ message: error.message || "Failed to fetch session" }, { status: 500 })
  }
}
