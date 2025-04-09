import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // List all buckets to test connection
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()

    if (bucketsError) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to list buckets",
          error: bucketsError.message,
          details: {
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
            serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
              ? "Set (length: " + process.env.SUPABASE_SERVICE_ROLE_KEY.length + ")"
              : "Not set",
          },
        },
        { status: 500 },
      )
    }

    // Check if images bucket exists
    const imagesBucket = buckets.find((bucket) => bucket.name === "images")

    if (!imagesBucket) {
      // Try to create the bucket
      const { data: newBucket, error: createError } = await supabaseAdmin.storage.createBucket("images", {
        public: true,
      })

      if (createError) {
        return NextResponse.json(
          {
            success: false,
            message: "Images bucket doesn't exist and failed to create it",
            error: createError.message,
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        message: "Successfully created images bucket",
        buckets: [...buckets, newBucket],
      })
    }

    // List files in the images bucket
    const { data: files, error: filesError } = await supabaseAdmin.storage.from("images").list()

    if (filesError) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to list files in images bucket",
          error: filesError.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Storage connection successful",
      buckets,
      imagesBucket,
      files: files || [],
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Unexpected error testing storage",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
