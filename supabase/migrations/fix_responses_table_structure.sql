-- Fix responses table structure
BEGIN;

-- Alter the responses table to ensure it has the correct structure
ALTER TABLE IF EXISTS responses 
  ALTER COLUMN response TYPE JSONB USING response::JSONB;

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_responses_session_id ON responses(session_id);
CREATE INDEX IF NOT EXISTS idx_responses_poll_id ON responses(poll_id);

-- Make sure the foreign key constraint exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'responses_session_id_fkey'
  ) THEN
    ALTER TABLE responses 
    ADD CONSTRAINT responses_session_id_fkey 
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;
  END IF;
END
$$;

COMMIT;

