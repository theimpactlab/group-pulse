import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

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

export async function deleteImage(url: string, bucket = "images") {
  const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!storageUrl) {
    throw new Error("Missing Supabase storage URL")
  }

  const path = url.replace(`${storageUrl}/storage/v1/object/public/${bucket}/`, "")

  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error

  return true
}
