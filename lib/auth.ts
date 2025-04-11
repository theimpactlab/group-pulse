import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabase } from "./supabase"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials")
          return null
        }

        try {
          console.log("Authenticating with Supabase:", credentials.email)

          // Authenticate with Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (error) {
            console.error("Supabase authentication error:", error)
            throw new Error(error.message)
          }

          if (!data.user) {
            console.error("No user returned from Supabase")
            throw new Error("Authentication failed")
          }

          console.log("Authentication successful, user:", data.user.id)

          // Get user profile data from the database
          const { data: userData, error: userError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single()

          if (userError) {
            console.log("Profile fetch error, creating profile:", userError)

            // If profile doesn't exist, create one
            const { data: newProfile, error: createError } = await supabase
              .from("profiles")
              .insert([
                {
                  id: data.user.id,
                  name: data.user.user_metadata?.name || data.user.email?.split("@")[0],
                  email: data.user.email,
                },
              ])
              .select()
              .single()

            if (createError) {
              console.error("Error creating profile:", createError)
            }

            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.name || data.user.email?.split("@")[0],
            }
          }

          return {
            id: data.user.id,
            email: data.user.email,
            name: userData?.name || data.user.user_metadata?.name || data.user.email?.split("@")[0],
            image: userData?.avatar_url || null,
          }
        } catch (error) {
          console.error("Auth error:", error)
          throw error // Re-throw to be caught by NextAuth
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("JWT callback - adding user data to token")
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.image = user.image
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        console.log("Session callback - adding token data to session")
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = (token.name as string) || null
        session.user.image = (token.image as string) || null
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}
