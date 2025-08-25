-- Create comment_likes table for comment reactions
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID NOT NULL REFERENCES public.post_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'celebrate', 'insightful', 'funny')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(comment_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON public.comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_user ON public.comment_likes(comment_id, user_id);

-- Enable Row Level Security
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view comment likes" ON public.comment_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own comment likes" ON public.comment_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comment likes" ON public.comment_likes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comment likes" ON public.comment_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to increment comment likes count
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

-- Create function to decrement comment likes count
CREATE OR REPLACE FUNCTION decrement_comment_likes(comment_id_param UUID, user_id_param UUID)
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.comment_likes 
    WHERE comment_id = comment_id_param AND user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
