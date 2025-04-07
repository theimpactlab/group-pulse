-- Simplified RLS policies that maintain basic security while being easier to manage
BEGIN;

-- Enable RLS on tables
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can create their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON sessions;
DROP POLICY IF EXISTS "Public can view active sessions" ON sessions;

DROP POLICY IF EXISTS "Users can create responses" ON responses;
DROP POLICY IF EXISTS "Users can view responses for their sessions" ON responses;
DROP POLICY IF EXISTS "Public can create responses" ON responses;

-- SESSIONS TABLE POLICIES

-- 1. Authenticated users can create sessions (only their own)
CREATE POLICY "Users can create sessions"
ON sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Authenticated users can view any session they created
CREATE POLICY "Users can view their own sessions"
ON sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Public users can view active sessions (for participation)
CREATE POLICY "Public can view active sessions"
ON sessions
FOR SELECT
TO anon
USING (status = 'active');

-- 4. Session owners can update their sessions
CREATE POLICY "Users can update their own sessions"
ON sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- 5. Session owners can delete their sessions
CREATE POLICY "Users can delete their own sessions"
ON sessions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RESPONSES TABLE POLICIES

-- 1. Anyone (authenticated or anonymous) can create responses
CREATE POLICY "Anyone can create responses"
ON responses
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- 2. Session owners can view responses to their sessions
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

