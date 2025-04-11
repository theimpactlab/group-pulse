import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with the service role key for admin access
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Check if this email has already used a trial
    const { data: expiredTrial, error: checkError } = await supabaseAdmin
      .from("expired_trials")
      .select("email")
      .eq("email", email.toLowerCase())
      .maybeSingle()

    if (checkError) {
      console.error("Error checking expired trials:", checkError)
      return NextResponse.json({ error: "An error occurred during registration" }, { status: 500 })
    }

    // If this email has already used a trial, reject the registration
    if (expiredTrial) {
      return NextResponse.json(
        { error: "This email has already used a free trial. Please use a different email or purchase a subscription." },
        { status: 400 },
      )
    }

    // Register the user with Supabase
    const { data, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    })

    if (signUpError) {
      console.error("Error creating user:", signUpError)
      return NextResponse.json({ error: signUpError.message }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Create a profile record with trial information
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + 30) // 30-day trial

    const { error: profileError } = await supabaseAdmin.from("profiles").insert([
      {
        id: data.user.id,
        name,
        email,
        subscription_tier: "free_trial",
        trial_start_date: new Date().toISOString(),
        subscription_end_date: trialEndDate.toISOString(),
        is_trial_expired: false,
        account_locked: false,
      },
    ])

    if (profileError) {
      console.error("Error creating profile:", profileError)
      // Continue anyway, as the auth record was created
    }

    return NextResponse.json({ success: true, message: "Registration successful" })
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: error.message || "Failed to register" }, { status: 500 })
  }
}
