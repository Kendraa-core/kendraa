-- Minimal Messaging Fix Script
-- This script creates the simplest possible RLS policies without any circular references

-- Step 1: Drop ALL existing policies to start completely fresh
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can join conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;

-- Step 2: Create minimal policies with NO circular references
-- Conversation participants - only allow users to see their own participation
CREATE POLICY "Users can view conversation participants" ON conversation_participants FOR SELECT USING (
    user_id = auth.uid()
);

CREATE POLICY "Users can join conversations" ON conversation_participants FOR INSERT WITH CHECK (
    auth.uid() = user_id
);

-- Messages - only allow users to see messages they sent or in conversations they're part of
CREATE POLICY "Users can view messages in their conversations" ON messages FOR SELECT USING (
    sender_id = auth.uid() OR
    conversation_id IN (
        SELECT conversation_id 
        FROM conversation_participants 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id
);

CREATE POLICY "Users can update their own messages" ON messages FOR UPDATE USING (
    auth.uid() = sender_id
);

CREATE POLICY "Users can delete their own messages" ON messages FOR DELETE USING (
    auth.uid() = sender_id
);

-- Conversations - only allow users to see conversations they participate in
CREATE POLICY "Users can view conversations they participate in" ON conversations FOR SELECT USING (
    id IN (
        SELECT conversation_id 
        FROM conversation_participants 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can create conversations" ON conversations FOR INSERT WITH CHECK (true);

-- Step 3: Create basic indexes
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id_created_at ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

-- Step 4: Test basic functionality
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
        INSERT INTO conversations (conversation_type, title)
        VALUES ('direct', 'Test Conversation')
        RETURNING id INTO conv_id;
        
        -- Add participants
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES (conv_id, user1_id), (conv_id, user2_id);
        
        -- Insert a test message
        INSERT INTO messages (conversation_id, sender_id, sender_type, content, message_type, is_read)
        VALUES (conv_id, user1_id, 'individual', 'Hello! This is a test message.', 'text', false);
        
        RAISE NOTICE 'Test conversation created with ID: %', conv_id;
    ELSE
        RAISE NOTICE 'Need at least 2 users to create test conversation';
    END IF;
END $$;

-- Success message
SELECT 'Minimal messaging policies created successfully! No circular references.' as status;
