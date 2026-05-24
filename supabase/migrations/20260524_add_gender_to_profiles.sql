-- Add gender column to profiles table
-- Run this in your Supabase SQL editor or via the Supabase CLI
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT
  CHECK (gender IN ('male', 'female', 'other'));
