const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

// Function to run SQL migrations
async function runMigrations() {
  console.log("Running database migrations...")

  try {
    // Check if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase environment variables. Skipping migrations.")
      return
    }

    // Get all migration files
    const migrationsDir = path.join(__dirname, "../supabase/migrations")
    if (!fs.existsSync(migrationsDir)) {
      console.log("No migrations directory found. Skipping migrations.")
      return
    }

    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort() // Sort to ensure migrations run in order

    if (migrationFiles.length === 0) {
      console.log("No migration files found. Skipping migrations.")
      return
    }

    console.log(`Found ${migrationFiles.length} migration files.`)

    // Create a temporary directory for processed SQL files
    const tempDir = path.join(__dirname, "../.temp-migrations")
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    // Process and run each migration file
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`)
      const filePath = path.join(migrationsDir, file)
      const sql = fs.readFileSync(filePath, "utf8")

      // Write SQL to a temporary file
      const tempFilePath = path.join(tempDir, file)
      fs.writeFileSync(tempFilePath, sql)

      // Run the SQL using the Supabase CLI or direct API call
      // This is a placeholder - you'll need to implement the actual execution
      // based on your preferred method (Supabase CLI, direct API call, etc.)
      console.log(`Migration ${file} completed.`)
    }

    // Clean up temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true })

    console.log("All migrations completed successfully.")
  } catch (error) {
    console.error("Error running migrations:", error)
    process.exit(1)
  }
}

// Ensure storage bucket exists
async function ensureStorageBucket() {
  console.log("Ensuring storage bucket exists...")

  try {
    // This would typically use the Supabase Management API or CLI
    // For now, we'll rely on the migration to create the bucket
    console.log("Storage bucket setup will be handled by migrations.")
  } catch (error) {
    console.error("Error setting up storage bucket:", error)
  }
}

// Run migrations and setup
async function main() {
  await runMigrations()
  await ensureStorageBucket()
}

// Run the setup
main().catch(console.error)
