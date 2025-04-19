-- Add a code column to the sessions table if it doesn't exist
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS code VARCHAR(10);

-- Create a unique index on the code column
CREATE UNIQUE INDEX IF NOT EXISTS sessions_code_unique_idx ON sessions(code);
