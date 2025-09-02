-- =====================================================
-- COMMENT LIKES TABLE SETUP
-- =====================================================
-- This script creates the comment_likes table and all necessary components
-- Run this in your Supabase SQL Editor to fix the 404 errors

-- Drop table if exists (for clean setup)
DROP TABLE IF EXISTS public.comment_likes CASCADE;

-- Create comment_likes table
CREATE TABLE public.comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID NOT NULL REFERENCES public.post_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'celebrate', 'insightful', 'funny')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure a user can only have one reaction per comment
    UNIQUE(comment_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user_id ON public.comment_likes(user_id);
CREATE INDEX idx_comment_likes_comment_user ON public.comment_likes(comment_id, user_id);
CREATE INDEX idx_comment_likes_reaction_type ON public.comment_likes(reaction_type);
CREATE INDEX idx_comment_likes_created_at ON public.comment_likes(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_comment_likes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_comment_likes_updated_at
    BEFORE UPDATE ON public.comment_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_comment_likes_updated_at();

-- Enable Row Level Security
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view comment likes" ON public.comment_likes;
DROP POLICY IF EXISTS "Users can insert their own comment likes" ON public.comment_likes;
DROP POLICY IF EXISTS "Users can update their own comment likes" ON public.comment_likes;
DROP POLICY IF EXISTS "Users can delete their own comment likes" ON public.comment_likes;

-- Create RLS policies
CREATE POLICY "Users can view comment likes" ON public.comment_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own comment likes" ON public.comment_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comment likes" ON public.comment_likes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comment likes" ON public.comment_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Create helper functions for comment reactions
CREATE OR REPLACE FUNCTION increment_comment_likes(comment_id_param UUID, user_id_param UUID, reaction_type_param TEXT DEFAULT 'like')
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.comment_likes (comment_id, user_id, reaction_type)
    VALUES (comment_id_param, user_id_param, reaction_type_param)
    ON CONFLICT (comment_id, user_id)
    DO UPDATE SET 
        reaction_type = reaction_type_param,
        created_at = timezone('utc'::text, now()),
        updated_at = timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_comment_likes(comment_id_param UUID, user_id_param UUID)
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.comment_likes 
    WHERE comment_id = comment_id_param AND user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON public.comment_likes TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Verify the table was created successfully
SELECT 
    'comment_likes table created successfully' as status,
    COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'comment_likes' 
AND table_schema = 'public';

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'comment_likes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'comment_likes' 
AND schemaname = 'public';

-- Show policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'comment_likes' 
AND schemaname = 'public';

-- Success message
SELECT '✅ comment_likes table setup completed successfully!' as result;
