-- Add a code column to the sessions table
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS code VARCHAR(10) UNIQUE;

-- Update existing sessions with random codes
UPDATE sessions SET code = SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6) WHERE code IS NULL;

-- Make sure the code is not null for future entries
ALTER TABLE sessions ALTER COLUMN code SET NOT NULL;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS sessions_code_idx ON sessions(code);
