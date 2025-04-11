-- Ensure avatar storage bucket exists
BEGIN;

-- Create storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for the avatars bucket
DROP POLICY IF EXISTS "Users can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete avatars" ON storage.objects;

-- Allow anyone to view avatars
CREATE POLICY "Users can view avatars"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users can update avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

COMMIT;
