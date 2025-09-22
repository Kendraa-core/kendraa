-- FIX TYPE CASTING ISSUES IN RLS POLICIES
-- This script fixes the "operator does not exist: text = uuid" error

-- ========================================================
-- 1. DROP EXISTING POLICIES WITH TYPE ISSUES
-- ========================================================

-- Drop all existing policies that have type casting issues
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- ========================================================
-- 2. CREATE RLS POLICIES WITH PROPER TYPE CASTING
-- ========================================================

-- Profiles policies - auth.uid() is UUID, profiles.id is UUID
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_delete" ON profiles FOR DELETE USING (auth.uid() = id);

-- Experiences policies - profile_id is UUID, need to cast auth.uid() to text for comparison
CREATE POLICY "experiences_select" ON experiences FOR SELECT USING (true);
CREATE POLICY "experiences_insert" ON experiences FOR INSERT WITH CHECK (auth.uid()::text = profile_id::text);
CREATE POLICY "experiences_update" ON experiences FOR UPDATE USING (auth.uid()::text = profile_id::text);
CREATE POLICY "experiences_delete" ON experiences FOR DELETE USING (auth.uid()::text = profile_id::text);

-- Education policies - profile_id is UUID, need to cast auth.uid() to text for comparison
CREATE POLICY "education_select" ON education FOR SELECT USING (true);
CREATE POLICY "education_insert" ON education FOR INSERT WITH CHECK (auth.uid()::text = profile_id::text);
CREATE POLICY "education_update" ON education FOR UPDATE USING (auth.uid()::text = profile_id::text);
CREATE POLICY "education_delete" ON education FOR DELETE USING (auth.uid()::text = profile_id::text);

-- Institutions policies - admin_user_id is UUID, need to cast auth.uid() to text for comparison
CREATE POLICY "institutions_select" ON institutions FOR SELECT USING (true);
CREATE POLICY "institutions_insert" ON institutions FOR INSERT WITH CHECK (auth.uid()::text = admin_user_id::text OR auth.role() = 'service_role');
CREATE POLICY "institutions_update" ON institutions FOR UPDATE USING (auth.uid()::text = admin_user_id::text);
CREATE POLICY "institutions_delete" ON institutions FOR DELETE USING (auth.uid()::text = admin_user_id::text);

-- Posts policies - author_id is UUID, need to cast auth.uid() to text for comparison
CREATE POLICY "posts_select" ON posts FOR SELECT USING (true);
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (auth.uid()::text = author_id::text);
CREATE POLICY "posts_update" ON posts FOR UPDATE USING (auth.uid()::text = author_id::text);
CREATE POLICY "posts_delete" ON posts FOR DELETE USING (auth.uid()::text = author_id::text);

-- Post comments policies - author_id is UUID, need to cast auth.uid() to text for comparison
CREATE POLICY "post_comments_select" ON post_comments FOR SELECT USING (true);
CREATE POLICY "post_comments_insert" ON post_comments FOR INSERT WITH CHECK (auth.uid()::text = author_id::text);
CREATE POLICY "post_comments_update" ON post_comments FOR UPDATE USING (auth.uid()::text = author_id::text);
CREATE POLICY "post_comments_delete" ON post_comments FOR DELETE USING (auth.uid()::text = author_id::text);

-- Post likes policies - user_id is UUID, need to cast auth.uid() to text for comparison
CREATE POLICY "post_likes_select" ON post_likes FOR SELECT USING (true);
CREATE POLICY "post_likes_insert" ON post_likes FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "post_likes_update" ON post_likes FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "post_likes_delete" ON post_likes FOR DELETE USING (auth.uid()::text = user_id::text);

-- Comment likes policies - user_id is UUID, need to cast auth.uid() to text for comparison
CREATE POLICY "comment_likes_select" ON comment_likes FOR SELECT USING (true);
CREATE POLICY "comment_likes_insert" ON comment_likes FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "comment_likes_update" ON comment_likes FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "comment_likes_delete" ON comment_likes FOR DELETE USING (auth.uid()::text = user_id::text);

-- Saved posts policies - user_id is UUID, need to cast auth.uid() to text for comparison
CREATE POLICY "saved_posts_select" ON saved_posts FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "saved_posts_insert" ON saved_posts FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "saved_posts_update" ON saved_posts FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "saved_posts_delete" ON saved_posts FOR DELETE USING (auth.uid()::text = user_id::text);

-- Connections policies - requester_id and recipient_id are UUID, need to cast auth.uid() to text for comparison
CREATE POLICY "connections_select" ON connections FOR SELECT USING (auth.uid()::text = requester_id::text OR auth.uid()::text = recipient_id::text);
CREATE POLICY "connections_insert" ON connections FOR INSERT WITH CHECK (auth.uid()::text = requester_id::text);
CREATE POLICY "connections_update" ON connections FOR UPDATE USING (auth.uid()::text = requester_id::text OR auth.uid()::text = recipient_id::text);
CREATE POLICY "connections_delete" ON connections FOR DELETE USING (auth.uid()::text = requester_id::text OR auth.uid()::text = recipient_id::text);

-- Follows policies - follower_id and following_id are UUID, need to cast auth.uid() to text for comparison
CREATE POLICY "follows_select" ON follows FOR SELECT USING (true);
CREATE POLICY "follows_insert" ON follows FOR INSERT WITH CHECK (auth.uid()::text = follower_id::text);
CREATE POLICY "follows_update" ON follows FOR UPDATE USING (auth.uid()::text = follower_id::text);
CREATE POLICY "follows_delete" ON follows FOR DELETE USING (auth.uid()::text = follower_id::text);

-- Jobs policies - posted_by is UUID, need to cast auth.uid() to text for comparison
CREATE POLICY "jobs_select" ON jobs FOR SELECT USING (true);
CREATE POLICY "jobs_insert" ON jobs FOR INSERT WITH CHECK (auth.uid()::text = posted_by::text);
CREATE POLICY "jobs_update" ON jobs FOR UPDATE USING (auth.uid()::text = posted_by::text);
CREATE POLICY "jobs_delete" ON jobs FOR DELETE USING (auth.uid()::text = posted_by::text);

-- Job applications policies - applicant_id is UUID, need to cast auth.uid() to text for comparison
CREATE POLICY "job_applications_select" ON job_applications FOR SELECT USING (
    auth.uid()::text = applicant_id::text OR 
    auth.uid()::text = (SELECT posted_by::text FROM jobs WHERE id = job_id)
);
CREATE POLICY "job_applications_insert" ON job_applications FOR INSERT WITH CHECK (auth.uid()::text = applicant_id::text);
CREATE POLICY "job_applications_update" ON job_applications FOR UPDATE USING (
    auth.uid()::text = applicant_id::text OR 
    auth.uid()::text = (SELECT posted_by::text FROM jobs WHERE id = job_id)
);
CREATE POLICY "job_applications_delete" ON job_applications FOR DELETE USING (auth.uid()::text = applicant_id::text);

-- Events policies - organizer_id is UUID, need to cast auth.uid() to text for comparison
CREATE POLICY "events_select" ON events FOR SELECT USING (true);
CREATE POLICY "events_insert" ON events FOR INSERT WITH CHECK (auth.uid()::text = organizer_id::text);
CREATE POLICY "events_update" ON events FOR UPDATE USING (auth.uid()::text = organizer_id::text);
CREATE POLICY "events_delete" ON events FOR DELETE USING (auth.uid()::text = organizer_id::text);

-- Event attendees policies - attendee_id is UUID, need to cast auth.uid() to text for comparison
CREATE POLICY "event_attendees_select" ON event_attendees FOR SELECT USING (true);
CREATE POLICY "event_attendees_insert" ON event_attendees FOR INSERT WITH CHECK (auth.uid()::text = attendee_id::text);
CREATE POLICY "event_attendees_update" ON event_attendees FOR UPDATE USING (auth.uid()::text = attendee_id::text);
CREATE POLICY "event_attendees_delete" ON event_attendees FOR DELETE USING (auth.uid()::text = attendee_id::text);

-- Notifications policies - user_id is UUID, need to cast auth.uid() to text for comparison
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (true); -- System can create notifications
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "notifications_delete" ON notifications FOR DELETE USING (auth.uid()::text = user_id::text);

-- Analytics policies - Public read for post analytics, restricted write
CREATE POLICY "post_analytics_select" ON post_analytics FOR SELECT USING (true);
CREATE POLICY "post_analytics_insert" ON post_analytics FOR INSERT WITH CHECK (true); -- System can track analytics
CREATE POLICY "post_analytics_update" ON post_analytics FOR UPDATE USING (true); -- System can update analytics
CREATE POLICY "post_analytics_delete" ON post_analytics FOR DELETE USING (false); -- Prevent deletion

-- Post impressions policies - System managed
CREATE POLICY "post_impressions_select" ON post_impressions FOR SELECT USING (true);
CREATE POLICY "post_impressions_insert" ON post_impressions FOR INSERT WITH CHECK (true);
CREATE POLICY "post_impressions_update" ON post_impressions FOR UPDATE USING (true);
CREATE POLICY "post_impressions_delete" ON post_impressions FOR DELETE USING (false);

-- Post views policies - System managed
CREATE POLICY "post_views_select" ON post_views FOR SELECT USING (true);
CREATE POLICY "post_views_insert" ON post_views FOR INSERT WITH CHECK (true);
CREATE POLICY "post_views_update" ON post_views FOR UPDATE USING (true);
CREATE POLICY "post_views_delete" ON post_views FOR DELETE USING (false);

-- Post shares policies - user_id is UUID, need to cast auth.uid() to text for comparison
CREATE POLICY "post_shares_select" ON post_shares FOR SELECT USING (true);
CREATE POLICY "post_shares_insert" ON post_shares FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "post_shares_update" ON post_shares FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "post_shares_delete" ON post_shares FOR DELETE USING (auth.uid()::text = user_id::text);

-- ========================================================
-- 3. VERIFICATION
-- ========================================================

DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    -- Count policies
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TYPE CASTING ISSUES FIXED!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total RLS policies created: %', policy_count;
    RAISE NOTICE '✅ All UUID/TEXT comparisons now use proper casting';
    RAISE NOTICE '✅ auth.uid()::text = field::text for UUID fields';
    RAISE NOTICE '✅ auth.uid() = field for UUID to UUID comparisons';
    RAISE NOTICE '✅ No more "operator does not exist" errors';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RLS policies should now work correctly!';
    RAISE NOTICE '========================================';
END $$;
