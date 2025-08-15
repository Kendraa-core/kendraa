-- Comprehensive Messaging System Setup Script
-- This script sets up the complete messaging system with proper RLS policies
-- Run this in your Supabase SQL Editor

-- Step 1: Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can join conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

-- Step 2: Create proper RLS policies for conversations table
CREATE POLICY "Users can view their conversations" ON conversations FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM conversation_participants 
        WHERE conversation_id = conversations.id 
        AND participant_id = auth.uid()
    )
);

CREATE POLICY "Users can create conversations" ON conversations FOR INSERT WITH CHECK (true);

-- Step 3: Create proper RLS policies for conversation_participants table
CREATE POLICY "Users can view conversation participants" ON conversation_participants FOR SELECT USING (
    participant_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM conversation_participants cp2
        WHERE cp2.conversation_id = conversation_participants.conversation_id 
        AND cp2.participant_id = auth.uid()
    )
);

CREATE POLICY "Users can join conversations" ON conversation_participants FOR INSERT WITH CHECK (
    auth.uid() = participant_id
);

CREATE POLICY "Users can leave conversations" ON conversation_participants FOR UPDATE USING (
    auth.uid() = participant_id
);

-- Step 4: Create proper RLS policies for messages table
CREATE POLICY "Users can view messages in their conversations" ON messages FOR SELECT USING (
    sender_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM conversation_participants cp
        WHERE cp.conversation_id = messages.conversation_id 
        AND cp.participant_id = auth.uid()
        AND (cp.left_at IS NULL OR cp.left_at > NOW())
    )
);

CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM conversation_participants cp
        WHERE cp.conversation_id = messages.conversation_id 
        AND cp.participant_id = auth.uid()
        AND (cp.left_at IS NULL OR cp.left_at > NOW())
    )
);

CREATE POLICY "Users can update their own messages" ON messages FOR UPDATE USING (
    auth.uid() = sender_id
);

CREATE POLICY "Users can delete their own messages" ON messages FOR DELETE USING (
    auth.uid() = sender_id
);

-- Step 5: Create helper functions for messaging
CREATE OR REPLACE FUNCTION create_direct_conversation(user1_id UUID, user2_id UUID)
RETURNS UUID AS $$
DECLARE
    conversation_id UUID;
BEGIN
    -- Create the conversation
    INSERT INTO conversations (conversation_type, title)
    VALUES ('direct', 'Direct Message')
    RETURNING id INTO conversation_id;
    
    -- Add both users as participants
    INSERT INTO conversation_participants (conversation_id, participant_id)
    VALUES 
        (conversation_id, user1_id),
        (conversation_id, user2_id);
    
    RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create function to get user conversations
CREATE OR REPLACE FUNCTION get_user_conversations(user_id UUID)
RETURNS TABLE (
    conversation_id UUID,
    conversation_type conversation_type,
    title TEXT,
    last_message_content TEXT,
    last_message_time TIMESTAMPTZ,
    unread_count BIGINT,
    participant_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.conversation_type,
        c.title,
        m.content,
        m.created_at,
        COALESCE(unread.unread_count, 0),
        COUNT(cp.participant_id)::BIGINT
    FROM conversations c
    INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
    LEFT JOIN LATERAL (
        SELECT content, created_at
        FROM messages 
        WHERE conversation_id = c.id 
        ORDER BY created_at DESC 
        LIMIT 1
    ) m ON true
    LEFT JOIN LATERAL (
        SELECT COUNT(*) as unread_count
        FROM messages 
        WHERE conversation_id = c.id 
        AND sender_id != user_id
        AND (read_by IS NULL OR NOT (read_by ? user_id::TEXT))
    ) unread ON true
    WHERE cp.participant_id = user_id
    AND (cp.left_at IS NULL OR cp.left_at > NOW())
    GROUP BY c.id, c.conversation_type, c.title, m.content, m.created_at, unread.unread_count
    ORDER BY m.created_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create function to mark messages as read
CREATE OR REPLACE FUNCTION mark_conversation_as_read(conv_id UUID, user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE messages 
    SET read_by = COALESCE(read_by, '{}'::JSONB) || jsonb_build_object(user_id::TEXT, NOW())
    WHERE conversation_id = conv_id 
    AND sender_id != user_id
    AND (read_by IS NULL OR NOT (read_by ? user_id::TEXT));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_direct_conversation(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_conversations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_conversation_as_read(UUID, UUID) TO authenticated;

-- Step 9: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversation_participants_participant_id ON conversation_participants(participant_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id_created_at ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);

-- Step 10: Test the setup (optional - remove in production)
-- This will create a test conversation if you have at least 2 users
DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    conv_id UUID;
BEGIN
    -- Get first two users (for testing only)
    SELECT id INTO user1_id FROM profiles LIMIT 1;
    SELECT id INTO user2_id FROM profiles WHERE id != user1_id LIMIT 1;
    
    IF user1_id IS NOT NULL AND user2_id IS NOT NULL THEN
        -- Create a test conversation
        SELECT create_direct_conversation(user1_id, user2_id) INTO conv_id;
        
        -- Insert a test message
        INSERT INTO messages (conversation_id, sender_id, sender_type, content)
        VALUES (conv_id, user1_id, 'individual', 'Hello! This is a test message.');
        
        RAISE NOTICE 'Test conversation created with ID: %', conv_id;
    ELSE
        RAISE NOTICE 'Need at least 2 users to create test conversation';
    END IF;
END $$;

-- Success message
SELECT 'Messaging system setup completed successfully!' as status;
