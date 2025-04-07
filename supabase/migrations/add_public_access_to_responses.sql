-- Add public access to responses for shared results
BEGIN;

-- Create policy to allow public (anonymous) users to view responses for active sessions
DROP POLICY IF EXISTS "Public can view responses for active sessions" ON responses;

CREATE POLICY "Public can view responses for active sessions"
ON responses
FOR SELECT
TO anon
USING (
  session_id IN (
    SELECT id FROM sessions WHERE status = 'active'
  )
);

COMMIT;

