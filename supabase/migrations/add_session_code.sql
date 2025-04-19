-- Add a code column to the sessions table
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS code VARCHAR(10) UNIQUE;

-- Update existing sessions with random codes
-- This is a placeholder - in production you'd want to handle this carefully
-- to avoid conflicts
