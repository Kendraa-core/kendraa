-- Fix Missing Database Tables
-- This script creates all missing tables and ensures proper structure

-- 1. Create comment_likes table for comment reactions
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID NOT NULL REFERENCES public.post_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'celebrate', 'insightful', 'funny')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(comment_id, user_id)
);

-- 2. Ensure post_comments table has parent_id column for replies
DO $$ 
BEGIN
    -- Check if parent_id column exists in post_comments
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'post_comments' 
        AND column_name = 'parent_id'
    ) THEN
        -- Add parent_id column if it doesn't exist
        ALTER TABLE public.post_comments 
        ADD COLUMN parent_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added parent_id column to post_comments table';
    ELSE
        RAISE NOTICE 'parent_id column already exists in post_comments table';
    END IF;
END $$;

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON public.comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_user ON public.comment_likes(comment_id, user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON public.post_comments(parent_id);

-- 4. Enable Row Level Security on comment_likes
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for comment_likes
CREATE POLICY "Users can view comment likes" ON public.comment_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own comment likes" ON public.comment_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comment likes" ON public.comment_likes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comment likes" ON public.comment_likes
    FOR DELETE USING (auth.uid() = user_id);

-- 6. Create function to increment comment likes count
CREATE OR REPLACE FUNCTION increment_comment_likes(comment_id_param UUID, user_id_param UUID, reaction_type_param TEXT DEFAULT 'like')
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.comment_likes (comment_id, user_id, reaction_type)
    VALUES (comment_id_param, user_id_param, reaction_type_param)
    ON CONFLICT (comment_id, user_id)
    DO UPDATE SET 
        reaction_type = reaction_type_param,
        created_at = timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to decrement comment likes count
CREATE OR REPLACE FUNCTION decrement_comment_likes(comment_id_param UUID, user_id_param UUID)
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.comment_likes 
    WHERE comment_id = comment_id_param AND user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Ensure post_comments table has all required columns
DO $$ 
BEGIN
    -- Check if likes_count column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'post_comments' 
        AND column_name = 'likes_count'
    ) THEN
        ALTER TABLE public.post_comments 
        ADD COLUMN likes_count INTEGER DEFAULT 0;
        
        RAISE NOTICE 'Added likes_count column to post_comments table';
    ELSE
        RAISE NOTICE 'likes_count column already exists in post_comments table';
    END IF;
    
    -- Check if author_type column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'post_comments' 
        AND column_name = 'author_type'
    ) THEN
        ALTER TABLE public.post_comments 
        ADD COLUMN author_type TEXT DEFAULT 'individual' CHECK (author_type IN ('individual', 'institution'));
        
        RAISE NOTICE 'Added author_type column to post_comments table';
    ELSE
        RAISE NOTICE 'author_type column already exists in post_comments table';
    END IF;
END $$;

-- 9. Update existing comments to have default values
UPDATE public.post_comments 
SET likes_count = 0 
WHERE likes_count IS NULL;

UPDATE public.post_comments 
SET author_type = 'individual' 
WHERE author_type IS NULL;

-- 10. Verify tables exist and show structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('comment_likes', 'post_comments')
ORDER BY table_name, ordinal_position;
