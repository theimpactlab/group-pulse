import { createClient } from "@supabase/supabase-js"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CopyLinkButton } from "@/components/copy-link-button"
import { QRCodeButton } from "@/components/qr-code-button"

// Create a Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export default async function SessionPage({ params }: { params: { id: string } }) {
  // Check authentication
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/login")
  }

  const id = params.id

  // Fetch session data
  const { data: sessionData, error } = await supabase.from("sessions").select("*").eq("id", id).single()

  if (error || !sessionData) {
    return (
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-4">Session not found</h1>
        <p className="text-gray-500 mb-4">
          The session you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button asChild>
          <Link href="/sessions">Back to Sessions</Link>
        </Button>
      </div>
    )
  }

  // Check if the session belongs to the current user
  if (sessionData.user_id !== session.user.id) {
    return (
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
        <p className="text-gray-500 mb-4">You don't have access to this session.</p>
        <Button asChild>
          <Link href="/sessions">Back to Sessions</Link>
        </Button>
      </div>
    )
  }

  // Generate join URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const joinUrl = `${baseUrl}/join/${id}`

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">{sessionData.title}</h1>
          {sessionData.description && <p className="text-gray-500 mt-1">{sessionData.description}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyLinkButton url={joinUrl} />
          <QRCodeButton url={joinUrl} title={sessionData.title} />
          <Button asChild variant="default">
            <Link href={`/sessions/${id}/present`}>Present</Link>
          </Button>
        </div>
      </div>

      {/* Rest of the session page content */}
    </div>
  )
}
