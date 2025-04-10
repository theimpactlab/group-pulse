-- Create themes table
BEGIN;

-- Check if the themes table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'themes'
  ) THEN
    -- Create the themes table
    CREATE TABLE themes (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      colors JSONB NOT NULL,
      font JSONB NOT NULL,
      border_radius TEXT,
      is_default BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
    );

    -- Enable RLS on the themes table
    ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

    -- Create policies for the themes table
    CREATE POLICY "Users can view their own themes"
    ON themes
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own themes"
    ON themes
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own themes"
    ON themes
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own themes"
    ON themes
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

    -- Create a trigger to update the updated_at column
    CREATE OR REPLACE FUNCTION update_themes_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER update_themes_updated_at
    BEFORE UPDATE ON themes
    FOR EACH ROW
    EXECUTE FUNCTION update_themes_updated_at_column();

    -- Create policy for default themes to be visible to all authenticated users
    CREATE POLICY "Default themes are visible to all authenticated users"
    ON themes
    FOR SELECT
    TO authenticated
    USING (is_default = TRUE);
  END IF;
END
$$;

-- Add theme_id column to sessions table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'sessions' 
    AND column_name = 'theme_id'
  ) THEN
    ALTER TABLE sessions ADD COLUMN theme_id UUID REFERENCES themes(id);
  END IF;
END
$$;

COMMIT;
