-- Fix database errors by adding missing post_comments table and policies

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

-- Enable RLS on post_comments table
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for post_comments table
CREATE POLICY "post_comments_select_policy" ON post_comments
    FOR SELECT USING (true);

CREATE POLICY "post_comments_insert_policy" ON post_comments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "post_comments_update_policy" ON post_comments
    FOR UPDATE USING (true);

CREATE POLICY "post_comments_delete_policy" ON post_comments
    FOR DELETE USING (true);

-- Ensure institutions table has proper policies (in case they were missing)
CREATE POLICY IF NOT EXISTS "institutions_select_policy" ON institutions
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "institutions_insert_policy" ON institutions
    FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "institutions_update_policy" ON institutions
    FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "institutions_delete_policy" ON institutions
    FOR DELETE USING (true);
