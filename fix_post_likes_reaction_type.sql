-- Fix post_likes table to add missing reaction_type column
-- This script will check the current structure and add the missing column

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

-- Add the missing reaction_type column if it doesn't exist
DO $$
BEGIN
    -- Check if reaction_type column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'post_likes' 
        AND column_name = 'reaction_type'
        AND table_schema = 'public'
    ) THEN
        -- Add the reaction_type column
        ALTER TABLE post_likes 
        ADD COLUMN reaction_type VARCHAR(50) DEFAULT 'like';
        
        -- Add an index for better performance
        CREATE INDEX IF NOT EXISTS idx_post_likes_reaction_type 
        ON post_likes(reaction_type);
        
        RAISE NOTICE 'Added reaction_type column to post_likes table';
    ELSE
        RAISE NOTICE 'reaction_type column already exists in post_likes table';
    END IF;
END $$;

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

-- Update existing records to have 'like' as default reaction_type
UPDATE post_likes 
SET reaction_type = 'like' 
WHERE reaction_type IS NULL;

-- Add a constraint to ensure reaction_type is not null
ALTER TABLE post_likes 
ALTER COLUMN reaction_type SET NOT NULL;

-- Add a check constraint to ensure valid reaction types
ALTER TABLE post_likes 
ADD CONSTRAINT check_reaction_type 
CHECK (reaction_type IN ('like', 'love', 'support', 'insightful', 'celebrate', 'curious'));

-- Grant necessary permissions (adjust as needed for your RLS setup)
-- This ensures the column is accessible through RLS policies
COMMENT ON COLUMN post_likes.reaction_type IS 'Type of reaction: like, love, support, insightful, celebrate, curious';

-- Final verification
SELECT 
    'post_likes table structure updated successfully' as status,
    COUNT(*) as total_records
FROM post_likes;
