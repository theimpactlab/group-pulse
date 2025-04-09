import { createClient } from "@supabase/supabase-js"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { redirect } from "next/navigation"

// Create a Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export default async function AnalyticsPage({ params }: { params: { id: string } }) {
  // Check authentication
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/login")
  }

  const sessionId = params.id

  // Fetch session data
  const { data: sessionData, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single()

  if (sessionError || !sessionData) {
    return (
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-4">Analytics</h1>
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-500">Session not found or you don't have access to it.</p>
        </div>
      </div>
    )
  }

  // Fetch responses
  const { data: responses, error: responsesError } = await supabase
    .from("responses")
    .select("*")
    .eq("session_id", sessionId)

  const responseCount = responses?.length || 0

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        {responseCount === 0 && (
          <Link
            href={`/sessions/${sessionId}/test-data`}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Generate test data
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Session Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500">Session Title</p>
            <p className="text-lg font-medium">{sessionData.title}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500">Total Responses</p>
            <p className="text-lg font-medium">{responseCount}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500">Slides</p>
            <p className="text-lg font-medium">{sessionData.content?.length || 0}</p>
          </div>
        </div>
      </div>

      {responseCount === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900">No responses yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Once participants respond to your session, you'll see analytics here.
            </p>
            <div className="mt-6">
              <Link
                href={`/sessions/${sessionId}/test-data`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Generate Test Data
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Response Data</h2>
          <p className="text-gray-500 mb-4">
            You have {responseCount} responses for this session. Detailed analytics are being processed.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slide ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {responses?.slice(0, 5).map((response) => (
                  <tr key={response.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{response.slide_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{response.participant_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(response.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {responseCount > 5 && <p className="text-sm text-gray-500 mt-4">Showing 5 of {responseCount} responses</p>}
          </div>
        </div>
      )}
    </div>
  )
}
