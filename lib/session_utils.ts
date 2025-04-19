/**
 * Generates a short, user-friendly session code
 * Format: 6 characters, alphanumeric, uppercase
 * Example: "AB12CD"
 */
export function generateSessionCode(): string {
  // Characters to use (excluding ambiguous characters like 0/O, 1/I)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let result = ""

  // Generate a 6-character code
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return result
}

/**
 * Checks if a session code already exists in the database
 */
export async function isSessionCodeUnique(code: string, supabase: any): Promise<boolean> {
  const { data } = await supabase.from("sessions").select("id").eq("code", code).single()

  return !data
}

/**
 * Generates a unique session code
 */
export async function generateUniqueSessionCode(supabase: any): Promise<string> {
  let code = generateSessionCode()
  let isUnique = await isSessionCodeUnique(code, supabase)

  // If code already exists, generate a new one (up to 5 attempts)
  let attempts = 0
  while (!isUnique && attempts < 5) {
    code = generateSessionCode()
    isUnique = await isSessionCodeUnique(code, supabase)
    attempts++
  }

  return code
}
