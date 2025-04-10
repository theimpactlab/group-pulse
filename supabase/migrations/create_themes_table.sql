-- Create themes table for custom session themes
BEGIN;

-- Create the themes table if it doesn't exist
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  colors JSONB NOT NULL,
  font JSONB NOT NULL,
  border_radius INTEGER DEFAULT 8,
  is_default BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on the themes table
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

-- Create policies for the themes table
CREATE POLICY "Users can view their own themes"
ON themes
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own themes"
ON themes
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own themes"
ON themes
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own themes"
ON themes
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Add theme_id column to sessions table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'sessions' 
    AND column_name = 'theme_id'
  ) THEN
    ALTER TABLE sessions ADD COLUMN theme_id UUID;
  END IF;
END
$$;

COMMIT;
