-- Update RLS policies for the responses table and add public access to sessions
BEGIN;

-- First, enable RLS on the responses table if not already enabled
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can create responses" ON responses;
DROP POLICY IF EXISTS "Users can view responses for their sessions" ON responses;
DROP POLICY IF EXISTS "Public can create responses" ON responses;

-- Create policy to allow authenticated users to create responses
CREATE POLICY "Users can create responses"
ON responses
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy to allow authenticated users to view responses for their sessions
CREATE POLICY "Users can view responses for their sessions"
ON responses
FOR SELECT
TO authenticated
USING (
  session_id IN (
    SELECT id FROM sessions WHERE user_id = auth.uid()
  )
);

-- Create policy to allow public (anonymous) users to create responses
CREATE POLICY "Public can create responses"
ON responses
FOR INSERT
TO anon
WITH CHECK (true);

-- Add a policy to allow public read access to active sessions
DROP POLICY IF EXISTS "Public can view active sessions" ON sessions;

CREATE POLICY "Public can view active sessions"
ON sessions
FOR SELECT
TO anon
USING (status = 'active' OR status = 'draft');

COMMIT;

