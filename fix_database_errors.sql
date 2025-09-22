-- Fix database errors by adding missing tables and policies

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

-- Enable RLS on tables
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

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
