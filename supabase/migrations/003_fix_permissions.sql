-- Fix permissions and RLS policies
-- This migration resolves permission denied errors

-- Temporarily disable RLS to fix permissions
ALTER TABLE IF EXISTS public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.connections DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.post_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.post_likes DISABLE ROW LEVEL SECURITY;

-- Grant full access to authenticated and anon users
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create or replace posts table with proper structure
DROP TABLE IF EXISTS public.posts CASCADE;
CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL,
    author_type VARCHAR(20) DEFAULT 'individual' CHECK (author_type IN ('individual', 'institution')),
    content TEXT NOT NULL,
    image_url TEXT,
    images TEXT[],
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'connections', 'private')),
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);

-- Grant permissions on new posts table
GRANT ALL ON public.posts TO anon, authenticated;

-- Enable RLS with permissive policies
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create very permissive policies for development
CREATE POLICY "Enable all operations for everyone" ON public.posts
    USING (true)
    WITH CHECK (true);

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL,
    actor_id UUID,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    read BOOLEAN DEFAULT FALSE,
    post_id UUID,
    connection_id UUID,
    job_id UUID,
    event_id UUID,
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant permissions and enable RLS for notifications
GRANT ALL ON public.notifications TO anon, authenticated;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for notifications" ON public.notifications
    USING (true)
    WITH CHECK (true);

-- Ensure connections table exists
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL,
    recipient_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(requester_id, recipient_id)
);

GRANT ALL ON public.connections TO anon, authenticated;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for connections" ON public.connections
    USING (true)
    WITH CHECK (true);

-- Insert some sample posts for testing
INSERT INTO public.posts (author_id, content, visibility) VALUES
    ('27f2aec2-daf1-46e2-a06e-f77ba1d332a0', 'Welcome to Kendra! 🏥 Excited to connect with healthcare professionals worldwide. #HealthcareNetwork #MedicalCommunity', 'public'),
    ('27f2aec2-daf1-46e2-a06e-f77ba1d332a0', 'Just attended an amazing cardiology conference. The latest research on minimally invasive procedures is groundbreaking! 💓 #Cardiology #Innovation', 'public'),
    ('27f2aec2-daf1-46e2-a06e-f77ba1d332a0', 'Looking for collaboration opportunities in telemedicine research. DM me if you''re working on remote patient monitoring solutions! 📱 #Telemedicine #Research', 'public');

-- Create post_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

GRANT ALL ON public.post_likes TO anon, authenticated;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for post_likes" ON public.post_likes
    USING (true)
    WITH CHECK (true);

-- Create RPC functions for like/unlike
CREATE OR REPLACE FUNCTION increment_likes_count(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE posts 
    SET likes_count = likes_count + 1 
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_likes_count(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE posts 
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on RPC functions
GRANT EXECUTE ON FUNCTION increment_likes_count(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION decrement_likes_count(UUID) TO anon, authenticated;

-- Final permissions grant
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated; 