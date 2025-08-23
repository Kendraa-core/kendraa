-- Fix post_likes table to add missing updated_at column
-- This script will add the updated_at column and update the existing records

-- First, let's check the current structure of post_likes table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'post_likes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add the missing updated_at column if it doesn't exist
DO $$
BEGIN
    -- Check if updated_at column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'post_likes' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        -- Add the updated_at column
        ALTER TABLE post_likes 
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        
        -- Add an index for better performance
        CREATE INDEX IF NOT EXISTS idx_post_likes_updated_at 
        ON post_likes(updated_at);
        
        RAISE NOTICE 'Added updated_at column to post_likes table';
    ELSE
        RAISE NOTICE 'updated_at column already exists in post_likes table';
    END IF;
END $$;

-- Update existing records to have updated_at set to created_at
UPDATE post_likes 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Add a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_post_likes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS trigger_update_post_likes_updated_at ON post_likes;
CREATE TRIGGER trigger_update_post_likes_updated_at
    BEFORE UPDATE ON post_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_post_likes_updated_at();

-- Verify the updated structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'post_likes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show triggers
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'post_likes'
AND trigger_schema = 'public';

-- Final verification
SELECT 
    'post_likes table updated successfully' as status,
    COUNT(*) as total_records,
    COUNT(CASE WHEN updated_at IS NOT NULL THEN 1 END) as records_with_updated_at
FROM post_likes;
