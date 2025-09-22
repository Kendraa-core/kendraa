-- Fix database errors by adding missing tables and policies
-- This script addresses permission issues and missing tables

-- First, ensure the institution_follows table exists and has proper permissions

-- Create post_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS post_comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL,
    content TEXT NOT NULL,
    parent_comment_id INTEGER REFERENCES post_comments(id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create post_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS post_likes (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL DEFAULT 'like',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- Create institution_follows table if it doesn't exist
CREATE TABLE IF NOT EXISTS institution_follows (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    institution_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, institution_id)
);

-- Create post_analytics table if it doesn't exist
CREATE TABLE IF NOT EXISTS post_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    impressions INTEGER DEFAULT 0,
    unique_impressions INTEGER DEFAULT 0,
    profile_views INTEGER DEFAULT 0,
    followers_gained INTEGER DEFAULT 0,
    video_views INTEGER DEFAULT 0,
    total_watch_time INTEGER DEFAULT 0,
    average_watch_time DECIMAL(5,2) DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    UNIQUE(post_id)
);

-- Create comment_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS comment_likes (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    comment_id INTEGER NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL DEFAULT 'like',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, comment_id)
);

-- Enable RLS on tables
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for post_comments table
-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "post_comments_select_policy" ON post_comments;
DROP POLICY IF EXISTS "post_comments_insert_policy" ON post_comments;
DROP POLICY IF EXISTS "post_comments_update_policy" ON post_comments;
DROP POLICY IF EXISTS "post_comments_delete_policy" ON post_comments;

CREATE POLICY "post_comments_select_policy" ON post_comments
    FOR SELECT USING (true);

CREATE POLICY "post_comments_insert_policy" ON post_comments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "post_comments_update_policy" ON post_comments
    FOR UPDATE USING (true);

CREATE POLICY "post_comments_delete_policy" ON post_comments
    FOR DELETE USING (true);

-- Create policies for post_likes table
-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "post_likes_select_policy" ON post_likes;
DROP POLICY IF EXISTS "post_likes_insert_policy" ON post_likes;
DROP POLICY IF EXISTS "post_likes_update_policy" ON post_likes;
DROP POLICY IF EXISTS "post_likes_delete_policy" ON post_likes;

CREATE POLICY "post_likes_select_policy" ON post_likes
    FOR SELECT USING (true);

CREATE POLICY "post_likes_insert_policy" ON post_likes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "post_likes_update_policy" ON post_likes
    FOR UPDATE USING (true);

CREATE POLICY "post_likes_delete_policy" ON post_likes
    FOR DELETE USING (true);

-- Create policies for institution_follows table
-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "institution_follows_select_policy" ON institution_follows;
DROP POLICY IF EXISTS "institution_follows_insert_policy" ON institution_follows;
DROP POLICY IF EXISTS "institution_follows_update_policy" ON institution_follows;
DROP POLICY IF EXISTS "institution_follows_delete_policy" ON institution_follows;

-- Create more permissive policies for institution_follows
CREATE POLICY "institution_follows_select_policy" ON institution_follows
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "institution_follows_insert_policy" ON institution_follows
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "institution_follows_update_policy" ON institution_follows
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "institution_follows_delete_policy" ON institution_follows
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for post_analytics table
-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "post_analytics_select_policy" ON post_analytics;
DROP POLICY IF EXISTS "post_analytics_insert_policy" ON post_analytics;
DROP POLICY IF EXISTS "post_analytics_update_policy" ON post_analytics;
DROP POLICY IF EXISTS "post_analytics_delete_policy" ON post_analytics;

CREATE POLICY "post_analytics_select_policy" ON post_analytics
    FOR SELECT USING (true);

CREATE POLICY "post_analytics_insert_policy" ON post_analytics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "post_analytics_update_policy" ON post_analytics
    FOR UPDATE USING (true);

CREATE POLICY "post_analytics_delete_policy" ON post_analytics
    FOR DELETE USING (true);

-- Create policies for comment_likes table
-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "comment_likes_select_policy" ON comment_likes;
DROP POLICY IF EXISTS "comment_likes_insert_policy" ON comment_likes;
DROP POLICY IF EXISTS "comment_likes_update_policy" ON comment_likes;
DROP POLICY IF EXISTS "comment_likes_delete_policy" ON comment_likes;

CREATE POLICY "comment_likes_select_policy" ON comment_likes
    FOR SELECT USING (true);

CREATE POLICY "comment_likes_insert_policy" ON comment_likes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "comment_likes_update_policy" ON comment_likes
    FOR UPDATE USING (true);

CREATE POLICY "comment_likes_delete_policy" ON comment_likes
    FOR DELETE USING (true);

-- Ensure institutions table has proper policies (in case they were missing)
-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "institutions_select_policy" ON institutions;
DROP POLICY IF EXISTS "institutions_insert_policy" ON institutions;
DROP POLICY IF EXISTS "institutions_update_policy" ON institutions;
DROP POLICY IF EXISTS "institutions_delete_policy" ON institutions;

CREATE POLICY "institutions_select_policy" ON institutions
    FOR SELECT USING (true);

CREATE POLICY "institutions_insert_policy" ON institutions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "institutions_update_policy" ON institutions
    FOR UPDATE USING (true);

CREATE POLICY "institutions_delete_policy" ON institutions
    FOR DELETE USING (true);

-- Additional verification and permission fixes
-- Ensure institution_follows table has proper permissions
DO $$
BEGIN
    -- Check if institution_follows table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'institution_follows') THEN
        -- Grant permissions to authenticated users
        GRANT ALL ON institution_follows TO authenticated;
        GRANT ALL ON institution_follows TO anon;
        
        -- Ensure RLS is enabled
        ALTER TABLE institution_follows ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'institution_follows table permissions updated successfully';
    ELSE
        RAISE NOTICE 'institution_follows table does not exist - will be created above';
    END IF;
END $$;
