-- =====================================================
-- ADD SHORT DESCRIPTION FIELD TO INSTITUTIONS TABLE
-- =====================================================
-- This script adds the missing short_description field and other missing fields
-- to the institutions table to fix the PGRST204 errors

-- Add missing fields to institutions table
ALTER TABLE institutions 
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS short_tagline TEXT,
ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#007fff',
ADD COLUMN IF NOT EXISTS social_media_links JSONB;

-- Update existing records to have default theme color if null
UPDATE institutions 
SET theme_color = '#007fff' 
WHERE theme_color IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN institutions.short_description IS 'Brief description shown in search results (max 200 characters)';
COMMENT ON COLUMN institutions.short_tagline IS 'One-line tagline about the institution (max 100 characters)';
COMMENT ON COLUMN institutions.theme_color IS 'Theme color for institution page styling (hex color code)';
COMMENT ON COLUMN institutions.social_media_links IS 'Social media links stored as JSON object';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'institutions' 
  AND column_name IN ('short_description', 'short_tagline', 'theme_color', 'social_media_links')
ORDER BY column_name;
