-- Create comment_likes table
-- This table stores user reactions to comments

CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure a user can only have one reaction per comment
    UNIQUE(comment_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_reaction_type ON comment_likes(reaction_type);
CREATE INDEX IF NOT EXISTS idx_comment_likes_created_at ON comment_likes(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_comment_likes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_likes_updated_at
    BEFORE UPDATE ON comment_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_comment_likes_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view all comment likes
CREATE POLICY "Users can view all comment likes" ON comment_likes
    FOR SELECT USING (true);

-- Users can insert their own comment likes
CREATE POLICY "Users can insert their own comment likes" ON comment_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own comment likes
CREATE POLICY "Users can update their own comment likes" ON comment_likes
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own comment likes
CREATE POLICY "Users can delete their own comment likes" ON comment_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON comment_likes TO authenticated;
GRANT USAGE ON SEQUENCE comment_likes_id_seq TO authenticated;

-- Insert some sample data (optional - remove if not needed)
-- INSERT INTO comment_likes (comment_id, user_id, reaction_type) 
-- SELECT 
--     pc.id as comment_id,
--     pc.author_id as user_id,
--     'like' as reaction_type
-- FROM post_comments pc
-- WHERE pc.id IN (SELECT id FROM post_comments LIMIT 5);

-- Verify the table was created
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'comment_likes' 
ORDER BY ordinal_position;
