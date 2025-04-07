import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with the service role key for admin access
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: Request) {
  try {
    const responseData = await request.json()

    // Validate required fields
    if (!responseData.id || !responseData.poll_id || !responseData.session_id) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Insert the response using admin privileges to bypass RLS
    const { data, error } = await supabaseAdmin
      .from("responses")
      .insert([
        {
          id: responseData.id,
          poll_id: responseData.poll_id,
          session_id: responseData.session_id,
          participant_name: responseData.participant_name || "Anonymous",
          response: responseData.response,
          created_at: responseData.created_at || new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error("Error inserting response:", error)
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ message: error.message || "Failed to submit response" }, { status: 500 })
  }
}

