-- Robust fix for infinite recursion in conversation_participants RLS policies
-- This script handles both possible column names (participant_id or user_id)

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;

-- Check what column name exists and create appropriate policies
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- Check if participant_id column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversation_participants' 
        AND column_name = 'participant_id'
        AND table_schema = 'public'
    ) INTO column_exists;
    
    IF column_exists THEN
        -- Use participant_id
        EXECUTE 'CREATE POLICY "Users can view conversation participants" ON conversation_participants FOR SELECT USING (participant_id = auth.uid())';
        
        EXECUTE 'CREATE POLICY "Users can view messages in their conversations" ON messages FOR SELECT USING (
            sender_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM conversation_participants cp
                WHERE cp.conversation_id = messages.conversation_id 
                AND cp.participant_id = auth.uid()
                AND (cp.left_at IS NULL OR cp.left_at > NOW())
            )
        )';
        
        RAISE NOTICE 'Created policies using participant_id column';
    ELSE
        -- Check if user_id column exists
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'conversation_participants' 
            AND column_name = 'user_id'
            AND table_schema = 'public'
        ) INTO column_exists;
        
        IF column_exists THEN
            -- Use user_id
            EXECUTE 'CREATE POLICY "Users can view conversation participants" ON conversation_participants FOR SELECT USING (user_id = auth.uid())';
            
            EXECUTE 'CREATE POLICY "Users can view messages in their conversations" ON messages FOR SELECT USING (
                sender_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM conversation_participants cp
                    WHERE cp.conversation_id = messages.conversation_id 
                    AND cp.user_id = auth.uid()
                    AND (cp.left_at IS NULL OR cp.left_at > NOW())
                )
            )';
            
            RAISE NOTICE 'Created policies using user_id column';
        ELSE
            RAISE EXCEPTION 'Neither participant_id nor user_id column found in conversation_participants table';
        END IF;
    END IF;
END $$;
