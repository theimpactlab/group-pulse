-- Fix responses table and policies
BEGIN;

-- Make sure the responses table has the correct structure
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'responses'
  ) THEN
    -- Create the responses table if it doesn't exist
    CREATE TABLE responses (
      id UUID PRIMARY KEY,
      poll_id UUID NOT NULL,
      session_id UUID NOT NULL,
      participant_name TEXT,
      response JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );
  END IF;
END
$$;

-- Enable RLS on the responses table
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can create responses" ON responses;
DROP POLICY IF EXISTS "Session owners can view responses" ON responses;
DROP POLICY IF EXISTS "Users can create responses" ON responses;
DROP POLICY IF EXISTS "Users can view responses for their sessions" ON responses;
DROP POLICY IF EXISTS "Public can create responses" ON responses;

-- Create policy to allow anyone (authenticated or anonymous) to create responses
CREATE POLICY "Anyone can create responses"
ON responses
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Create policy to allow session owners to view responses to their sessions
CREATE POLICY "Session owners can view responses"
ON responses
FOR SELECT
TO authenticated
USING (
  session_id IN (
    SELECT id FROM sessions WHERE user_id = auth.uid()
  )
);

COMMIT;

