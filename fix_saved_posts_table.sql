-- Fix saved_posts table - Create missing table and functions
-- This script will create the saved_posts table and add necessary functions

-- First, let's check if saved_posts table exists
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'saved_posts' 
AND table_schema = 'public';

-- Create saved_posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS saved_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, post_id) -- Prevent duplicate saves
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_post_id ON saved_posts(post_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_created_at ON saved_posts(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for saved_posts table
-- Policy: Users can only see their own saved posts
CREATE POLICY "Users can view their own saved posts" ON saved_posts
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can save posts
CREATE POLICY "Users can save posts" ON saved_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can unsave their own posts
CREATE POLICY "Users can unsave their own posts" ON saved_posts
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to save a post
CREATE OR REPLACE FUNCTION save_post(post_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;
    
    -- Check if post exists
    IF NOT EXISTS (SELECT 1 FROM posts WHERE id = post_id_param) THEN
        RAISE EXCEPTION 'Post does not exist';
    END IF;
    
    -- Insert saved post (UNIQUE constraint will prevent duplicates)
    INSERT INTO saved_posts (user_id, post_id)
    VALUES (current_user_id, post_id_param)
    ON CONFLICT (user_id, post_id) DO NOTHING;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to unsave a post
CREATE OR REPLACE FUNCTION unsave_post(post_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;
    
    -- Delete saved post
    DELETE FROM saved_posts 
    WHERE user_id = current_user_id AND post_id = post_id_param;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if a post is saved by current user
CREATE OR REPLACE FUNCTION is_post_saved(post_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    saved_count INTEGER;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if post is saved
    SELECT COUNT(*) INTO saved_count
    FROM saved_posts 
    WHERE user_id = current_user_id AND post_id = post_id_param;
    
    RETURN saved_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get saved posts for current user
CREATE OR REPLACE FUNCTION get_user_saved_posts(limit_param INTEGER DEFAULT 10, offset_param INTEGER DEFAULT 0)
RETURNS TABLE (
    post_id UUID,
    saved_at TIMESTAMPTZ
) AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN;
    END IF;
    
    -- Return saved posts
    RETURN QUERY
    SELECT sp.post_id, sp.created_at as saved_at
    FROM saved_posts sp
    WHERE sp.user_id = current_user_id
    ORDER BY sp.created_at DESC
    LIMIT limit_param
    OFFSET offset_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT, INSERT, DELETE ON saved_posts TO authenticated;
GRANT EXECUTE ON FUNCTION save_post(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION unsave_post(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_post_saved(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_saved_posts(INTEGER, INTEGER) TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE saved_posts IS 'Table to store user saved posts';
COMMENT ON COLUMN saved_posts.user_id IS 'User who saved the post';
COMMENT ON COLUMN saved_posts.post_id IS 'Post that was saved';
COMMENT ON COLUMN saved_posts.created_at IS 'When the post was saved';

-- Verify the table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'saved_posts' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show created policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'saved_posts'
AND schemaname = 'public';

-- Final verification
SELECT 
    'saved_posts table created successfully' as status,
    COUNT(*) as total_saved_posts
FROM saved_posts;
