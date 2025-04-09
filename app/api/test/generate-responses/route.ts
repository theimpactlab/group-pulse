import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Create a Supabase client with the service role key for admin access
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Helper function to generate a random response for a slide
function generateRandomResponse(sessionId: string, slide: any) {
  const baseResponse = {
    session_id: sessionId,
    slide_id: slide.id,
    participant_id: `test-user-${Math.floor(Math.random() * 1000)}`,
    created_at: new Date().toISOString(),
  }

  switch (slide.type) {
    case "multiple-choice":
      if (slide.data && slide.data.options && slide.data.options.length > 0) {
        const options = slide.data.options
        const selectedIndex = Math.floor(Math.random() * options.length)
        const selectedOption = options[selectedIndex]
        return {
          ...baseResponse,
          data: {
            selectedOptions: selectedOption.id || `option-${selectedIndex}`,
          },
        }
      }
      break

    case "word-cloud":
      const words = [
        "amazing",
        "great",
        "awesome",
        "good",
        "excellent",
        "fantastic",
        "wonderful",
        "superb",
        "outstanding",
        "terrific",
      ]
      return {
        ...baseResponse,
        data: {
          text: words[Math.floor(Math.random() * words.length)],
        },
      }

    case "rating":
      const maxRating = slide.data?.maxRating || 5
      return {
        ...baseResponse,
        data: {
          rating: Math.floor(Math.random() * maxRating) + 1,
        },
      }

    case "open-ended":
      const responses = [
        "I think this is great!",
        "Could use some improvements.",
        "Very interesting concept.",
        "I'm not sure about this.",
        "Definitely worth exploring further.",
      ]
      return {
        ...baseResponse,
        data: {
          text: responses[Math.floor(Math.random() * responses.length)],
        },
      }

    default:
      return {
        ...baseResponse,
        data: {
          value: "Sample response",
        },
      }
  }

  // Default fallback
  return {
    ...baseResponse,
    data: {
      value: "Sample response",
    },
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { sessionId, count = 10 } = body

    if (!sessionId) {
      return NextResponse.json({ message: "Session ID is required" }, { status: 400 })
    }

    // Fetch the session to get slides
    const { data: sessionData, error: sessionError } = await supabaseAdmin
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", session.user.id)
      .single()

    if (sessionError || !sessionData) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 })
    }

    const slides = sessionData.content || []

    if (slides.length === 0) {
      return NextResponse.json({ message: "Session has no slides" }, { status: 400 })
    }

    // Generate random responses
    const responses = []
    for (let i = 0; i < count; i++) {
      // Pick a random slide
      const slide = slides[Math.floor(Math.random() * slides.length)]
      const response = generateRandomResponse(sessionId, slide)
      if (response) {
        responses.push(response)
      }
    }

    // Insert responses into the database
    const { data, error } = await supabaseAdmin.from("responses").insert(responses).select()

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${responses.length} test responses`,
      count: responses.length,
    })
  } catch (error: any) {
    console.error("Error generating test responses:", error)
    return NextResponse.json({ message: error.message || "An error occurred" }, { status: 500 })
  }
}
