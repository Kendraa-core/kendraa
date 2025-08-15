-- Quick Fix for Messaging System
-- Run this script to fix immediate messaging issues

-- 1. Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can join conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

-- 2. Create simple, working policies with dynamic column detection
DO $$
DECLARE
    column_name TEXT;
BEGIN
    -- Check which column name exists
    SELECT column_name INTO column_name
    FROM information_schema.columns 
    WHERE table_name = 'conversation_participants' 
    AND table_schema = 'public'
    AND column_name IN ('participant_id', 'user_id')
    LIMIT 1;
    
    IF column_name = 'participant_id' THEN
        -- Create policies using participant_id
        EXECUTE 'CREATE POLICY "Users can view conversation participants" ON conversation_participants FOR SELECT USING (participant_id = auth.uid())';
        EXECUTE 'CREATE POLICY "Users can join conversations" ON conversation_participants FOR INSERT WITH CHECK (auth.uid() = participant_id)';
        RAISE NOTICE 'Created policies using participant_id column';
    ELSIF column_name = 'user_id' THEN
        -- Create policies using user_id
        EXECUTE 'CREATE POLICY "Users can view conversation participants" ON conversation_participants FOR SELECT USING (user_id = auth.uid())';
        EXECUTE 'CREATE POLICY "Users can join conversations" ON conversation_participants FOR INSERT WITH CHECK (auth.uid() = user_id)';
        RAISE NOTICE 'Created policies using user_id column';
    ELSE
        RAISE EXCEPTION 'Neither participant_id nor user_id column found in conversation_participants table';
    END IF;
END $$;

-- 3. Create simple message policies
CREATE POLICY "Users can view messages in their conversations" ON messages FOR SELECT USING (
    sender_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM conversation_participants cp
        WHERE cp.conversation_id = messages.conversation_id 
        AND cp.participant_id = auth.uid()
    )
);

CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id
);

CREATE POLICY "Users can update their own messages" ON messages FOR UPDATE USING (
    auth.uid() = sender_id
);

CREATE POLICY "Users can view their conversations" ON conversations FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM conversation_participants 
        WHERE conversation_id = conversations.id 
        AND participant_id = auth.uid()
    )
);

CREATE POLICY "Users can create conversations" ON conversations FOR INSERT WITH CHECK (true);

-- 4. Create a simple test conversation function
CREATE OR REPLACE FUNCTION test_messaging()
RETURNS TEXT AS $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    conv_id UUID;
    column_name TEXT;
BEGIN
    -- Check which column name to use
    SELECT column_name INTO column_name
    FROM information_schema.columns 
    WHERE table_name = 'conversation_participants' 
    AND table_schema = 'public'
    AND column_name IN ('participant_id', 'user_id')
    LIMIT 1;
    
    -- Get first two users
    SELECT id INTO user1_id FROM profiles LIMIT 1;
    SELECT id INTO user2_id FROM profiles WHERE id != user1_id LIMIT 1;
    
    IF user1_id IS NULL OR user2_id IS NULL THEN
        RETURN 'Need at least 2 users to test messaging';
    END IF;
    
    -- Create conversation
    INSERT INTO conversations (conversation_type, title)
    VALUES ('direct', 'Test Conversation')
    RETURNING id INTO conv_id;
    
    -- Add participants using the correct column name
    IF column_name = 'participant_id' THEN
        INSERT INTO conversation_participants (conversation_id, participant_id)
        VALUES (conv_id, user1_id), (conv_id, user2_id);
    ELSE
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES (conv_id, user1_id), (conv_id, user2_id);
    END IF;
    
    -- Add test message
    INSERT INTO messages (conversation_id, sender_id, sender_type, content)
    VALUES (conv_id, user1_id, 'individual', 'Test message from user 1');
    
    RETURN 'Test conversation created successfully with ID: ' || conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION test_messaging() TO authenticated;

-- 6. Run test
SELECT test_messaging() as result;
