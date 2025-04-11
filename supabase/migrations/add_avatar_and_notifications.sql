-- Add avatar and notifications support
BEGIN;

-- Update profiles table to ensure avatar_url column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
  END IF;
END
$$;

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create notification_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_session_activity BOOLEAN NOT NULL DEFAULT TRUE,
  email_responses BOOLEAN NOT NULL DEFAULT TRUE,
  email_trial_updates BOOLEAN NOT NULL DEFAULT TRUE,
  email_security BOOLEAN NOT NULL DEFAULT TRUE,
  email_marketing BOOLEAN NOT NULL DEFAULT FALSE,
  push_session_activity BOOLEAN NOT NULL DEFAULT TRUE,
  push_responses BOOLEAN NOT NULL DEFAULT TRUE,
  push_trial_updates BOOLEAN NOT NULL DEFAULT TRUE,
  push_security BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS on the notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for the notifications table
CREATE POLICY "Users can view their own notifications"
ON notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Enable RLS on the notification_preferences table
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for the notification_preferences table
CREATE POLICY "Users can view their own notification preferences"
ON notification_preferences
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notification preferences"
ON notification_preferences
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Create storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for the avatars bucket
DROP POLICY IF EXISTS "Users can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;

CREATE POLICY "Users can view avatars"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'avatars');

COMMIT;
