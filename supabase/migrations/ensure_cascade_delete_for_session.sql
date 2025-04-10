-- Ensure cascade delete is properly set up for sessions and responses
BEGIN;

-- Check if the foreign key constraint exists with CASCADE
DO $$
BEGIN
  -- Drop the constraint if it exists but doesn't have CASCADE
  IF EXISTS (
    SELECT FROM information_schema.table_constraints 
    WHERE constraint_name = 'responses_session_id_fkey' 
    AND table_name = 'responses'
  ) AND NOT EXISTS (
    SELECT FROM information_schema.referential_constraints
    WHERE constraint_name = 'responses_session_id_fkey'
    AND delete_rule = 'CASCADE'
  ) THEN
    ALTER TABLE responses DROP CONSTRAINT responses_session_id_fkey;
  END IF;

  -- Add the constraint with CASCADE if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.table_constraints 
    WHERE constraint_name = 'responses_session_id_fkey' 
    AND table_name = 'responses'
  ) THEN
    ALTER TABLE responses 
    ADD CONSTRAINT responses_session_id_fkey 
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;
  END IF;
END
$$;

COMMIT;
