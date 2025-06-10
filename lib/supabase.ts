import { createClient } from "@supabase/supabase-js"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if environment variables are properly set
if (!supabaseUrl || supabaseUrl.includes("your_supabase_url")) {
  console.error("Missing or invalid NEXT_PUBLIC_SUPABASE_URL environment variable")
  throw new Error("Supabase URL not configured. Please set the NEXT_PUBLIC_SUPABASE_URL environment variable.")
}

if (!supabaseAnonKey || supabaseAnonKey.includes("your_supabase_anon_key")) {
  console.error("Missing or invalid NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
  throw new Error(
    "Supabase Anon Key not configured. Please set the NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.",
  )
}

// Create a singleton Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false, // Prevent multiple instances from URL detection
      },
    })
  }
  return supabaseInstance
}

// Export the singleton instance
export const supabase = getSupabaseClient()

// Helper functions for sessions
export async function fetchSessions(userId: string) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function fetchSessionById(id: string) {
  const { data, error } = await supabase.from("sessions").select("*").eq("id", id).single()

  if (error) throw error
  return data
}

export async function createSession(sessionData: any) {
  const { data, error } = await supabase.from("sessions").insert([sessionData]).select()

  if (error) throw error
  return data[0]
}

export async function updateSession(id: string, sessionData: any) {
  const { data, error } = await supabase.from("sessions").update(sessionData).eq("id", id).select()

  if (error) throw error
  return data[0]
}

export async function deleteSession(id: string) {
  const { error } = await supabase.from("sessions").delete().eq("id", id)

  if (error) throw error
  return true
}

// Helper functions for responses
export async function fetchResponses(sessionId: string) {
  const { data, error } = await supabase.from("responses").select("*").eq("session_id", sessionId)

  if (error) throw error
  return data
}

export async function saveResponse(responseData: any) {
  const { data, error } = await supabase.from("responses").insert([responseData]).select()

  if (error) throw error
  return data[0]
}

// Helper function for image uploads
export async function uploadImage(file: File, bucket = "images") {
  const fileExt = file.name.split(".").pop()
  const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
  const filePath = `poll-images/${fileName}`

  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) throw error

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath)
  return publicUrlData.publicUrl
}
