-- Fix for missing comment_likes table
-- This will resolve the 404 errors in the console

-- Create the comment_likes table
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID NOT NULL REFERENCES public.post_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'celebrate', 'insightful', 'funny')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(comment_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON public.comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_reaction_type ON public.comment_likes(reaction_type);
CREATE INDEX IF NOT EXISTS idx_comment_likes_created_at ON public.comment_likes(created_at);

-- Enable RLS
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all comment likes" ON public.comment_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own comment likes" ON public.comment_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comment likes" ON public.comment_likes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comment likes" ON public.comment_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_comment_likes_updated_at 
    BEFORE UPDATE ON public.comment_likes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.comment_likes TO authenticated;
GRANT ALL ON public.comment_likes TO service_role;

-- Insert some sample data if needed (optional)
-- INSERT INTO public.comment_likes (comment_id, user_id, reaction_type) 
-- SELECT pc.id, pc.user_id, 'like' 
-- FROM public.post_comments pc 
-- LIMIT 10;

COMMENT ON TABLE public.comment_likes IS 'Stores user reactions (likes) on post comments';
COMMENT ON COLUMN public.comment_likes.reaction_type IS 'Type of reaction: like, love, celebrate, insightful, funny';
