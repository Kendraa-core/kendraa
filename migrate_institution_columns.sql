-- Migration script to add missing columns to institutions table
-- Run this in your Supabase SQL editor

-- Add missing columns to institutions table
ALTER TABLE institutions 
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS established_year INTEGER,
ADD COLUMN IF NOT EXISTS size TEXT,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS short_tagline TEXT,
ADD COLUMN IF NOT EXISTS accreditation TEXT[],
ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#007fff',
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS social_media_links JSONB;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'institutions' 
ORDER BY ordinal_position;
