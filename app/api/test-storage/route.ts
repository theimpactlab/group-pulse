import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    // List all buckets to test connection
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()

    if (bucketsError) {
      return NextResponse.json({ error: bucketsError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      buckets: buckets.map((b: any) => ({ name: b.name, public: b.public })),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Storage test failed" }, { status: 500 })
  }
}
