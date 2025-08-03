-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS public.event_attendees CASCADE;
DROP TABLE IF EXISTS public.job_applications CASCADE;
DROP TABLE IF EXISTS public.post_likes CASCADE;
DROP TABLE IF EXISTS public.post_comments CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.connections CASCADE;
DROP TABLE IF EXISTS public.education CASCADE;
DROP TABLE IF EXISTS public.experiences CASCADE;
DROP TABLE IF EXISTS public.profile_views CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.institutions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    headline VARCHAR(500),
    bio TEXT,
    location VARCHAR(255),
    avatar_url TEXT,
    cover_url TEXT,
    specialization TEXT[],
    user_type VARCHAR(50) DEFAULT 'individual',
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Institutions table
CREATE TABLE public.institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- 'hospital', 'clinic', 'university', etc.
    description TEXT,
    location VARCHAR(255),
    website VARCHAR(255),
    logo_url TEXT,
    cover_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    employee_count INTEGER,
    founded_year INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts table
CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL,
    author_type VARCHAR(20) DEFAULT 'profile',
    content TEXT NOT NULL,
    image_url TEXT,
    images TEXT[],
    visibility VARCHAR(20) DEFAULT 'public',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    company_id UUID REFERENCES public.institutions(id),
    posted_by UUID REFERENCES public.profiles(id),
    location VARCHAR(255),
    job_type VARCHAR(50), -- 'full-time', 'part-time', 'contract', etc.
    salary_min INTEGER,
    salary_max INTEGER,
    experience_level VARCHAR(50),
    specializations TEXT[],
    requirements TEXT[],
    benefits TEXT[],
    application_deadline TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    organizer_id UUID NOT NULL,
    organizer_type VARCHAR(20) DEFAULT 'profile',
    event_type VARCHAR(50), -- 'conference', 'webinar', 'workshop', etc.
    event_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    location VARCHAR(255),
    is_virtual BOOLEAN DEFAULT FALSE,
    virtual_link TEXT,
    image_url TEXT,
    max_attendees INTEGER,
    registration_deadline TIMESTAMPTZ,
    price DECIMAL(10,2) DEFAULT 0,
    specializations TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experiences table
CREATE TABLE public.experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Education table
CREATE TABLE public.education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    institution VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    field_of_study VARCHAR(255),
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    grade VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Connections table
CREATE TABLE public.connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(requester_id, recipient_id)
);

-- Post Comments table
CREATE TABLE public.post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post Likes table
CREATE TABLE public.post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Job Applications table
CREATE TABLE public.job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    cover_letter TEXT,
    resume_url TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'accepted', 'rejected'
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id, applicant_id)
);

-- Event Attendees table
CREATE TABLE public.event_attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    attendee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'registered', -- 'registered', 'attended', 'cancelled'
    registration_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, attendee_id)
);

-- Notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'connection_request', 'connection_accepted', 'post_like', 'post_comment', 'job_application', 'event_invitation'
    title VARCHAR(255) NOT NULL,
    message TEXT,
    read BOOLEAN DEFAULT FALSE,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    connection_id UUID REFERENCES public.connections(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HIPAA-Compliant Messaging System Tables

-- Conversations table
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    conversation_type VARCHAR(20) NOT NULL DEFAULT 'direct' CHECK (conversation_type IN ('direct', 'group', 'clinical')),
    is_archived BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    last_message_at TIMESTAMPTZ,
    participants_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation participants table
CREATE TABLE public.conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_type VARCHAR(20) NOT NULL DEFAULT 'individual' CHECK (user_type IN ('individual', 'institution')),
    role VARCHAR(20) NOT NULL DEFAULT 'participant' CHECK (role IN ('participant', 'admin', 'moderator')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    is_muted BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- Messages table (HIPAA-compliant)
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL DEFAULT 'individual' CHECK (sender_type IN ('individual', 'institution')),
    content TEXT NOT NULL,
    message_type VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system', 'clinical_note')),
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    forwarded_from_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    read_by UUID[] DEFAULT '{}', -- Array of user IDs who have read the message
    delivered_to UUID[] DEFAULT '{}', -- Array of user IDs who have received the message
    encryption_level VARCHAR(20) NOT NULL DEFAULT 'standard' CHECK (encryption_level IN ('standard', 'hipaa', 'encrypted')),
    retention_policy VARCHAR(20) NOT NULL DEFAULT 'standard' CHECK (retention_policy IN ('standard', 'clinical', 'permanent')),
    audit_trail JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message attachments table
CREATE TABLE public.message_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_url TEXT NOT NULL,
    encryption_key TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    mime_type VARCHAR(100) NOT NULL,
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message reactions table
CREATE TABLE public.message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry', 'clinical_important')),
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id, reaction_type)
);

-- Clinical notes table (HIPAA-compliant)
CREATE TABLE public.clinical_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    patient_id TEXT, -- Encrypted patient identifier
    clinical_context TEXT NOT NULL,
    diagnosis_codes TEXT[] DEFAULT '{}',
    treatment_notes TEXT,
    medication_notes TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date TIMESTAMPTZ,
    urgency_level VARCHAR(20) NOT NULL DEFAULT 'routine' CHECK (urgency_level IN ('routine', 'urgent', 'emergency')),
    confidentiality_level VARCHAR(30) NOT NULL DEFAULT 'standard' CHECK (confidentiality_level IN ('standard', 'restricted', 'highly_confidential')),
    audit_trail JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messaging settings table
CREATE TABLE public.messaging_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    sound_enabled BOOLEAN DEFAULT TRUE,
    read_receipts_enabled BOOLEAN DEFAULT TRUE,
    typing_indicators_enabled BOOLEAN DEFAULT TRUE,
    auto_archive_days INTEGER DEFAULT 30,
    message_retention_days INTEGER DEFAULT 365,
    encryption_preference VARCHAR(20) NOT NULL DEFAULT 'standard' CHECK (encryption_preference IN ('standard', 'hipaa', 'encrypted')),
    clinical_messaging_enabled BOOLEAN DEFAULT FALSE,
    audit_logging_enabled BOOLEAN DEFAULT TRUE,
    hipaa_compliance_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Profile Views table
CREATE TABLE public.profile_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, viewer_id, viewed_at::DATE)
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_posts_author_id ON public.posts(author_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_connections_requester ON public.connections(requester_id);
CREATE INDEX idx_connections_recipient ON public.connections(recipient_id);
CREATE INDEX idx_connections_status ON public.connections(status);
CREATE INDEX idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX idx_job_applications_applicant_id ON public.job_applications(applicant_id);
CREATE INDEX idx_event_attendees_event_id ON public.event_attendees(event_id);
CREATE INDEX idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Enable RLS for messaging tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messaging_settings ENABLE ROW LEVEL SECURITY;

-- Create indexes for messaging tables
CREATE INDEX idx_conversations_created_at ON public.conversations(created_at DESC);
CREATE INDEX idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_message_attachments_message_id ON public.message_attachments(message_id);
CREATE INDEX idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX idx_clinical_notes_message_id ON public.clinical_notes(message_id);
CREATE INDEX idx_messaging_settings_user_id ON public.messaging_settings(user_id);

-- RLS Policies

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid()::uuid = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid()::uuid = id);

-- Institutions policies
CREATE POLICY "Institutions are viewable by everyone" ON public.institutions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create institutions" ON public.institutions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Posts policies
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid()::uuid = author_id);
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid()::uuid = author_id);
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid()::uuid = author_id);

-- Jobs policies
CREATE POLICY "Jobs are viewable by everyone" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid()::uuid = posted_by);
CREATE POLICY "Users can update their own jobs" ON public.jobs FOR UPDATE USING (auth.uid()::uuid = posted_by);

-- Events policies
CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events" ON public.events FOR INSERT WITH CHECK (auth.uid()::uuid = organizer_id);
CREATE POLICY "Users can update their own events" ON public.events FOR UPDATE USING (auth.uid()::uuid = organizer_id);

-- Experiences policies
CREATE POLICY "Experiences are viewable by everyone" ON public.experiences FOR SELECT USING (true);
CREATE POLICY "Users can manage their own experiences" ON public.experiences FOR ALL USING (auth.uid()::uuid = profile_id);

-- Education policies
CREATE POLICY "Education is viewable by everyone" ON public.education FOR SELECT USING (true);
CREATE POLICY "Users can manage their own education" ON public.education FOR ALL USING (auth.uid()::uuid = profile_id);

-- Connections policies
CREATE POLICY "Users can view their own connections" ON public.connections FOR SELECT USING (
    auth.uid()::uuid = requester_id OR auth.uid()::uuid = recipient_id
);
CREATE POLICY "Users can create connection requests" ON public.connections FOR INSERT WITH CHECK (auth.uid()::uuid = requester_id);
CREATE POLICY "Users can update connections they're part of" ON public.connections FOR UPDATE USING (
    auth.uid()::uuid = requester_id OR auth.uid()::uuid = recipient_id
);

-- Post Comments policies
CREATE POLICY "Comments are viewable by everyone" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.post_comments FOR INSERT WITH CHECK (auth.uid()::uuid = author_id);
CREATE POLICY "Users can update their own comments" ON public.post_comments FOR UPDATE USING (auth.uid()::uuid = author_id);
CREATE POLICY "Users can delete their own comments" ON public.post_comments FOR DELETE USING (auth.uid()::uuid = author_id);

-- Post Likes policies
CREATE POLICY "Likes are viewable by everyone" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like posts" ON public.post_likes FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);
CREATE POLICY "Users can remove their own likes" ON public.post_likes FOR DELETE USING (auth.uid()::uuid = user_id);

-- Job Applications policies
CREATE POLICY "Users can view applications for their jobs" ON public.job_applications FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.jobs WHERE id = job_id AND posted_by = auth.uid()::uuid)
    OR auth.uid()::uuid = applicant_id
);
CREATE POLICY "Users can apply to jobs" ON public.job_applications FOR INSERT WITH CHECK (auth.uid()::uuid = applicant_id);
CREATE POLICY "Users can update their own applications" ON public.job_applications FOR UPDATE USING (auth.uid()::uuid = applicant_id);

-- Event Attendees policies
CREATE POLICY "Event attendees are viewable by organizers" ON public.event_attendees FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = auth.uid()::uuid)
    OR auth.uid()::uuid = attendee_id
);
CREATE POLICY "Users can register for events" ON public.event_attendees FOR INSERT WITH CHECK (auth.uid()::uuid = attendee_id);
CREATE POLICY "Users can update their own event registrations" ON public.event_attendees FOR UPDATE USING (auth.uid()::uuid = attendee_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid()::uuid = recipient_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid()::uuid = recipient_id);

-- Profile Views policies
CREATE POLICY "Users can view their own profile views" ON public.profile_views FOR SELECT USING (auth.uid()::uuid = profile_id);
CREATE POLICY "Authenticated users can record profile views" ON public.profile_views FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Messaging RLS Policies

-- Conversations policies
CREATE POLICY "Users can view conversations they participate in" ON public.conversations FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.conversation_participants 
        WHERE conversation_id = id AND user_id = auth.uid()::uuid
    )
);
CREATE POLICY "Authenticated users can create conversations" ON public.conversations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Conversation participants can update conversations" ON public.conversations FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.conversation_participants 
        WHERE conversation_id = id AND user_id = auth.uid()::uuid AND role IN ('admin', 'moderator')
    )
);

-- Conversation participants policies
CREATE POLICY "Users can view participants in their conversations" ON public.conversation_participants FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.conversation_participants cp2
        WHERE cp2.conversation_id = conversation_id AND cp2.user_id = auth.uid()::uuid
    )
);
CREATE POLICY "Authenticated users can join conversations" ON public.conversation_participants FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);
CREATE POLICY "Users can update their own participation" ON public.conversation_participants FOR UPDATE USING (auth.uid()::uuid = user_id);

-- Messages policies (HIPAA-compliant)
CREATE POLICY "Users can view messages in their conversations" ON public.messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.conversation_participants 
        WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()::uuid
    )
);
CREATE POLICY "Authenticated users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid()::uuid = sender_id);
CREATE POLICY "Users can edit their own messages" ON public.messages FOR UPDATE USING (auth.uid()::uuid = sender_id);
CREATE POLICY "Users can delete their own messages" ON public.messages FOR DELETE USING (auth.uid()::uuid = sender_id);

-- Message attachments policies
CREATE POLICY "Users can view attachments in their conversations" ON public.message_attachments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.messages m
        JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
        WHERE m.id = message_id AND cp.user_id = auth.uid()::uuid
    )
);
CREATE POLICY "Authenticated users can upload attachments" ON public.message_attachments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Message reactions policies
CREATE POLICY "Users can view reactions in their conversations" ON public.message_reactions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.messages m
        JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
        WHERE m.id = message_id AND cp.user_id = auth.uid()::uuid
    )
);
CREATE POLICY "Authenticated users can react to messages" ON public.message_reactions FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);
CREATE POLICY "Users can remove their own reactions" ON public.message_reactions FOR DELETE USING (auth.uid()::uuid = user_id);

-- Clinical notes policies (HIPAA-compliant)
CREATE POLICY "Authorized users can view clinical notes" ON public.clinical_notes FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.messages m
        JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
        WHERE m.id = message_id AND cp.user_id = auth.uid()::uuid
    )
);
CREATE POLICY "Authorized users can create clinical notes" ON public.clinical_notes FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.messages m
        WHERE m.id = message_id AND m.sender_id = auth.uid()::uuid
    )
);
CREATE POLICY "Users can update their own clinical notes" ON public.clinical_notes FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.messages m
        WHERE m.id = message_id AND m.sender_id = auth.uid()::uuid
    )
);

-- Messaging settings policies
CREATE POLICY "Users can view their own messaging settings" ON public.messaging_settings FOR SELECT USING (auth.uid()::uuid = user_id);
CREATE POLICY "Users can create their own messaging settings" ON public.messaging_settings FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);
CREATE POLICY "Users can update their own messaging settings" ON public.messaging_settings FOR UPDATE USING (auth.uid()::uuid = user_id);

-- Database Functions

-- Function to increment post likes count
CREATE OR REPLACE FUNCTION increment_likes_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.posts
    SET likes_count = likes_count + 1
    WHERE id = post_id::uuid;
END;
$$;

-- Function to decrement post likes count
CREATE OR REPLACE FUNCTION decrement_likes_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.posts
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = post_id::uuid;
END;
$$;

-- Function to increment post comments count
CREATE OR REPLACE FUNCTION increment_comments_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.posts
    SET comments_count = comments_count + 1
    WHERE id = post_id::uuid;
END;
$$;

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
    VALUES (
        NEW.id::uuid,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Sample data for testing
INSERT INTO public.profiles (id, email, full_name, headline, specialization, user_type) VALUES
    ('11111111-1111-1111-1111-111111111111', 'dr.smith@hospital.com', 'Dr. John Smith', 'Cardiologist at General Hospital', ARRAY['Cardiology', 'Internal Medicine'], 'individual'),
    ('22222222-2222-2222-2222-222222222222', 'jane.doe@clinic.com', 'Dr. Jane Doe', 'Pediatrician', ARRAY['Pediatrics'], 'individual'),
    ('33333333-3333-3333-3333-333333333333', 'mike.johnson@med.edu', 'Dr. Mike Johnson', 'Medical Professor', ARRAY['Medical Education', 'Surgery'], 'individual');

INSERT INTO public.institutions (id, name, type, description, location) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'General Hospital', 'hospital', 'Leading healthcare provider in the region', 'New York, NY'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Medical University', 'university', 'Premier medical education institution', 'Boston, MA'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Community Clinic', 'clinic', 'Serving the local community with quality care', 'Los Angeles, CA');

INSERT INTO public.posts (author_id, content, visibility) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Excited to share our latest research findings on cardiovascular health! #cardiology #research', 'public'),
    ('22222222-2222-2222-2222-222222222222', 'Just completed a successful pediatric surgery. Grateful for the amazing team! #pediatrics #teamwork', 'public'),
    ('33333333-3333-3333-3333-333333333333', 'Teaching the next generation of doctors is truly rewarding. #medicaleducation #future', 'public');

INSERT INTO public.jobs (title, description, posted_by, location, job_type, specializations) VALUES
    ('Senior Cardiologist', 'We are seeking an experienced cardiologist to join our team.', '11111111-1111-1111-1111-111111111111', 'New York, NY', 'full-time', ARRAY['Cardiology']),
    ('Pediatric Nurse', 'Looking for a compassionate pediatric nurse.', '22222222-2222-2222-2222-222222222222', 'Boston, MA', 'full-time', ARRAY['Pediatrics', 'Nursing']),
    ('Medical Researcher', 'Research position in medical education.', '33333333-3333-3333-3333-333333333333', 'Los Angeles, CA', 'contract', ARRAY['Research', 'Medical Education']);

INSERT INTO public.events (title, description, organizer_id, event_date, location, event_type, specializations) VALUES
    ('Cardiology Conference 2024', 'Annual conference on latest developments in cardiology.', '11111111-1111-1111-1111-111111111111', '2024-06-15 09:00:00', 'New York, NY', 'conference', ARRAY['Cardiology']),
    ('Pediatric Care Workshop', 'Hands-on workshop for pediatric care providers.', '22222222-2222-2222-2222-222222222222', '2024-07-20 14:00:00', 'Boston, MA', 'workshop', ARRAY['Pediatrics']),
    ('Medical Education Symposium', 'Symposium on innovations in medical education.', '33333333-3333-3333-3333-333333333333', '2024-08-10 10:00:00', 'Los Angeles, CA', 'symposium', ARRAY['Medical Education']);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated; 