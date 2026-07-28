import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let clientInstance: SupabaseClient | null = null

/**
 * Lazily create the public Supabase client.
 * Only instantiated at request time, not at build time.
 */
function getSupabaseClient(): SupabaseClient {
  if (!clientInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
    }
    clientInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  }
  return clientInstance
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient()
    const value = (client as never)[prop]
    return typeof value === "function" ? value.bind(client) : value
  },
})

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
