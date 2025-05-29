"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Session {
  id: string
  title: string
  code: string
}

export default function ThankYouPage({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchSession()
  }, [params.id])

  const fetchSession = async () => {
    try {
      const { data: sessionData, error } = await supabase
        .from("sessions")
        .select("id, title, code")
        .eq("id", params.id)
        .single()

      if (error) throw error
      setSession(sessionData)
    } catch (error) {
      console.error("Error fetching session:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Thank You!</CardTitle>
          <CardDescription>Your response has been submitted successfully.</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {session && (
            <div>
              <p className="text-sm text-muted-foreground">
                Session: <span className="font-medium">{session.title}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Code: <span className="font-mono font-bold">{session.code}</span>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Button onClick={() => router.push(`/participate/${params.id}`)} variant="outline" className="w-full">
              Return to Session
            </Button>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
