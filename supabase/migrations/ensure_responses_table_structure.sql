-- Ensure responses table has the correct structure
BEGIN;

-- Check if the responses table exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'responses'
  ) THEN
    CREATE TABLE responses (
      id UUID PRIMARY KEY,
      poll_id UUID NOT NULL,
      session_id UUID NOT NULL,
      participant_name TEXT,
      participant_id TEXT,
      response JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );
  ELSE
    -- Table exists, ensure all columns are present
    -- Add poll_id if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'responses' 
      AND column_name = 'poll_id'
    ) THEN
      ALTER TABLE responses ADD COLUMN poll_id UUID NOT NULL;
    END IF;

    -- Add session_id if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'responses' 
      AND column_name = 'session_id'
    ) THEN
      ALTER TABLE responses ADD COLUMN session_id UUID NOT NULL;
    END IF;

    -- Add participant_name if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'responses' 
      AND column_name = 'participant_name'
    ) THEN
      ALTER TABLE responses ADD COLUMN participant_name TEXT;
    END IF;

    -- Add participant_id if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'responses' 
      AND column_name = 'participant_id'
    ) THEN
      ALTER TABLE responses ADD COLUMN participant_id TEXT;
    END IF;

    -- Add response if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'responses' 
      AND column_name = 'response'
    ) THEN
      ALTER TABLE responses ADD COLUMN response JSONB NOT NULL;
    ELSE
      -- Ensure response column is JSONB type
      ALTER TABLE responses ALTER COLUMN response TYPE JSONB USING response::JSONB;
    END IF;

    -- Add created_at if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'responses' 
      AND column_name = 'created_at'
    ) THEN
      ALTER TABLE responses ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;

    -- Ensure foreign key constraint exists
    IF NOT EXISTS (
      SELECT FROM information_schema.table_constraints 
      WHERE constraint_name = 'responses_session_id_fkey' 
      AND table_name = 'responses'
    ) THEN
      ALTER TABLE responses 
      ADD CONSTRAINT responses_session_id_fkey 
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;
    END IF;
  END IF;
END
$$;

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_responses_session_id ON responses(session_id);
CREATE INDEX IF NOT EXISTS idx_responses_poll_id ON responses(poll_id);
CREATE INDEX IF NOT EXISTS idx_responses_participant_id ON responses(participant_id);

-- Enable Row Level Security
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can create responses" ON responses;
DROP POLICY IF EXISTS "Session owners can view responses" ON responses;

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

