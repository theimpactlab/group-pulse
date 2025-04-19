"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function JoinRedirectPage() {
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    // Redirect to the participate page directly
    if (params.id) {
      router.push(`/participate/${params.id}`)
    }
  }, [params.id, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
