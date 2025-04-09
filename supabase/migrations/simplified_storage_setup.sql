-- Simplified storage setup without complex policies
BEGIN;

-- Create the images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Service role can do anything" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can insert images" ON storage.objects;

-- Create a single policy that allows public access for viewing
CREATE POLICY "Public Access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'images');

-- Create a policy that allows the service role to do anything
CREATE POLICY "Admin Access"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'images');

COMMIT;
