-- Update RLS policies for the sessions table
BEGIN;

-- First, enable RLS on the sessions table if not already enabled
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can create their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON sessions;

-- Create policy to allow users to create their own sessions
CREATE POLICY "Users can create their own sessions"
ON sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to view their own sessions
CREATE POLICY "Users can view their own sessions"
ON sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policy to allow users to update their own sessions
CREATE POLICY "Users can update their own sessions"
ON sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own sessions
CREATE POLICY "Users can delete their own sessions"
ON sessions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

COMMIT;

