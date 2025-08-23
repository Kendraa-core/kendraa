-- Fix events functionality - Create missing tables
-- This script will create the events and event_attendees tables

-- First, let's check if events table exists
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name IN ('events', 'event_attendees') 
AND table_schema = 'public'
ORDER BY table_name;

-- Create events table if it doesn't exist
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    location TEXT,
    venue TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('conference', 'workshop', 'seminar', 'webinar', 'networking', 'training')),
    specializations TEXT[],
    organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organizer_type TEXT NOT NULL CHECK (organizer_type IN ('individual', 'institution')),
    max_attendees INTEGER,
    registration_fee DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    is_virtual BOOLEAN DEFAULT FALSE,
    meeting_link TEXT,
    banner_url TEXT,
    attendees_count INTEGER DEFAULT 0
);

-- Create event_attendees table if it doesn't exist
CREATE TABLE IF NOT EXISTS event_attendees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    attendee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    attendee_type TEXT NOT NULL CHECK (attendee_type IN ('individual', 'institution')),
    status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
    registration_date TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, attendee_id) -- Prevent duplicate registrations
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_attendee_id ON event_attendees(attendee_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_status ON event_attendees(status);

-- Add RLS (Row Level Security) policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Events are viewable by everyone" ON events
    FOR SELECT USING (true);

CREATE POLICY "Users can create events" ON events
    FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their events" ON events
    FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their events" ON events
    FOR DELETE USING (auth.uid() = organizer_id);

-- Event attendees policies
CREATE POLICY "Event attendees are viewable by everyone" ON event_attendees
    FOR SELECT USING (true);

CREATE POLICY "Users can register for events" ON event_attendees
    FOR INSERT WITH CHECK (auth.uid() = attendee_id);

CREATE POLICY "Users can update their own registrations" ON event_attendees
    FOR UPDATE USING (auth.uid() = attendee_id);

CREATE POLICY "Users can cancel their own registrations" ON event_attendees
    FOR DELETE USING (auth.uid() = attendee_id);

-- Create function to update attendees count
CREATE OR REPLACE FUNCTION update_event_attendees_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE events 
        SET attendees_count = attendees_count + 1,
            updated_at = NOW()
        WHERE id = NEW.event_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE events 
        SET attendees_count = GREATEST(0, attendees_count - 1),
            updated_at = NOW()
        WHERE id = OLD.event_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update attendees count
DROP TRIGGER IF EXISTS trigger_update_event_attendees_count ON event_attendees;

CREATE TRIGGER trigger_update_event_attendees_count
    AFTER INSERT OR DELETE ON event_attendees
    FOR EACH ROW
    EXECUTE FUNCTION update_event_attendees_count();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_events_updated_at ON events;

CREATE TRIGGER trigger_update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample events for testing
INSERT INTO events (
    title,
    description,
    start_date,
    end_date,
    location,
    venue,
    event_type,
    specializations,
    organizer_id,
    organizer_type,
    max_attendees,
    registration_fee,
    currency,
    status,
    is_virtual,
    meeting_link
) VALUES 
(
    'Healthcare Innovation Summit 2024',
    'Join industry leaders for a comprehensive discussion on the future of healthcare technology and patient care innovation.',
    '2024-03-15 09:00:00+00',
    '2024-03-15 17:00:00+00',
    'San Francisco, CA',
    'Moscone Center',
    'conference',
    ARRAY['Technology', 'Innovation', 'Patient Care'],
    (SELECT id FROM profiles LIMIT 1),
    'individual',
    500,
    299.00,
    'USD',
    'upcoming',
    FALSE,
    NULL
),
(
    'Digital Health Transformation Webinar',
    'Learn about the latest digital health solutions and how they''re transforming patient care delivery.',
    '2024-03-20 14:00:00+00',
    '2024-03-20 15:30:00+00',
    'Virtual',
    NULL,
    'webinar',
    ARRAY['Digital Health', 'Technology'],
    (SELECT id FROM profiles LIMIT 1),
    'individual',
    200,
    0.00,
    'USD',
    'upcoming',
    TRUE,
    'https://zoom.us/j/123456789'
),
(
    'Medical Leadership Workshop',
    'Develop essential leadership skills for healthcare professionals in management roles.',
    '2024-04-05 10:00:00+00',
    '2024-04-05 16:00:00+00',
    'New York, NY',
    'Medical Center Conference Room',
    'workshop',
    ARRAY['Leadership', 'Management'],
    (SELECT id FROM profiles LIMIT 1),
    'individual',
    50,
    150.00,
    'USD',
    'upcoming',
    FALSE,
    NULL
)
ON CONFLICT DO NOTHING;

-- Verify the tables were created successfully
SELECT 
    'events' as table_name,
    COUNT(*) as row_count
FROM events
UNION ALL
SELECT 
    'event_attendees' as table_name,
    COUNT(*) as row_count
FROM event_attendees;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'events' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'event_attendees' 
AND table_schema = 'public'
ORDER BY ordinal_position;
