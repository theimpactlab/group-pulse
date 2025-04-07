-- Fix session update policies to ensure users can save their sessions
BEGIN;

-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "Users can update their own sessions" ON sessions;

-- Create a more permissive policy for updating sessions
CREATE POLICY "Users can update their own sessions"
ON sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ensure the policy is properly applied
COMMENT ON POLICY "Users can update their own sessions" ON sessions
IS 'Allow users to update their own sessions';

COMMIT;

