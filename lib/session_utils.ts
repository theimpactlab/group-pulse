/**
 * Generates a random session code of specified length
 * @param length Length of the code (default: 6)
 * @returns A random alphanumeric code in uppercase
 */
export function generateSessionCode(length = 6): string {
  // Use characters that are less likely to be confused with each other
  // Exclude: 0/O, 1/I, etc.
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let result = ""

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result += characters.charAt(randomIndex)
  }

  return result
}

/**
 * Checks if a string looks like a UUID
 * @param str String to check
 * @returns True if the string matches UUID format
 */
export function isUuid(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}
