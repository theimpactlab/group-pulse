"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Log session status changes
  useEffect(() => {
    console.log("Session status changed:", status)
    console.log("Session data:", session)

    if (status === "authenticated") {
      console.log("User is authenticated, redirecting to:", callbackUrl)
      // Use window.location for a hard redirect instead of router.push
      window.location.href = callbackUrl
    }
  }, [status, session, callbackUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("Attempting to sign in with:", email)

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      console.log("Sign in result:", result)

      if (!result) {
        throw new Error("No result returned from signIn")
      }

      if (result.error) {
        console.error("Sign in error:", result.error)
        setError(result.error === "CredentialsSignin" ? "Invalid email or password" : result.error)
        setIsLoading(false)
        return
      }

      // Success - show toast
      toast.success("Login successful! Redirecting...")

      // Keep the loading state active until the redirect happens
      // The useEffect will handle the redirect when session status changes
    } catch (error: any) {
      console.error("Unexpected login error:", error)
      setError(error.message || "An unexpected error occurred")
      setIsLoading(false)
    }
  }

  // If still checking authentication status, show loading
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Sign in to your account</CardTitle>
          <CardDescription>Enter your email and password to sign in</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
