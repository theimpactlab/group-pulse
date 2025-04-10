import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// Add more detailed error handling
const handler = NextAuth({
  ...authOptions,
  debug: process.env.NODE_ENV === "development",
})

export { handler as GET, handler as POST }
