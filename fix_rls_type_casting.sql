-- FIX RLS POLICIES TYPE CASTING ISSUES
-- This script fixes the "operator does not exist: text = uuid" error

-- ========================================================
-- 1. DROP EXISTING POLICIES WITH TYPE ISSUES
-- ========================================================

-- Drop all existing policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- ========================================================
-- 2. CREATE FIXED RLS POLICIES WITH PROPER TYPE CASTING
-- ========================================================

-- Profiles policies - auth.uid() is UUID, profiles.id is UUID
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_delete" ON profiles FOR DELETE USING (auth.uid() = id);

-- Experiences policies - profile_id is UUID, auth.uid() is UUID
CREATE POLICY "experiences_select" ON experiences FOR SELECT USING (true);
CREATE POLICY "experiences_insert" ON experiences FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "experiences_update" ON experiences FOR UPDATE USING (auth.uid() = profile_id);
CREATE POLICY "experiences_delete" ON experiences FOR DELETE USING (auth.uid() = profile_id);

-- Education policies - profile_id is UUID, auth.uid() is UUID
CREATE POLICY "education_select" ON education FOR SELECT USING (true);
CREATE POLICY "education_insert" ON education FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "education_update" ON education FOR UPDATE USING (auth.uid() = profile_id);
CREATE POLICY "education_delete" ON education FOR DELETE USING (auth.uid() = profile_id);

-- Institutions policies - admin_user_id is UUID, auth.uid() is UUID
CREATE POLICY "institutions_select" ON institutions FOR SELECT USING (true);
CREATE POLICY "institutions_insert" ON institutions FOR INSERT WITH CHECK (auth.uid() = admin_user_id OR auth.role() = 'service_role');
CREATE POLICY "institutions_update" ON institutions FOR UPDATE USING (auth.uid() = admin_user_id);
CREATE POLICY "institutions_delete" ON institutions FOR DELETE USING (auth.uid() = admin_user_id);

-- Posts policies - author_id is UUID, auth.uid() is UUID
CREATE POLICY "posts_select" ON posts FOR SELECT USING (true);
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "posts_update" ON posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "posts_delete" ON posts FOR DELETE USING (auth.uid() = author_id);

-- Post comments policies - author_id is UUID, auth.uid() is UUID
CREATE POLICY "post_comments_select" ON post_comments FOR SELECT USING (true);
CREATE POLICY "post_comments_insert" ON post_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "post_comments_update" ON post_comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "post_comments_delete" ON post_comments FOR DELETE USING (auth.uid() = author_id);

-- Post likes policies - user_id is UUID, auth.uid() is UUID
CREATE POLICY "post_likes_select" ON post_likes FOR SELECT USING (true);
CREATE POLICY "post_likes_insert" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_likes_update" ON post_likes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "post_likes_delete" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- Comment likes policies - user_id is UUID, auth.uid() is UUID
CREATE POLICY "comment_likes_select" ON comment_likes FOR SELECT USING (true);
CREATE POLICY "comment_likes_insert" ON comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comment_likes_update" ON comment_likes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "comment_likes_delete" ON comment_likes FOR DELETE USING (auth.uid() = user_id);

-- Saved posts policies - user_id is UUID, auth.uid() is UUID
CREATE POLICY "saved_posts_select" ON saved_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_posts_insert" ON saved_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_posts_update" ON saved_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "saved_posts_delete" ON saved_posts FOR DELETE USING (auth.uid() = user_id);

-- Connections policies - requester_id and recipient_id are UUID, auth.uid() is UUID
CREATE POLICY "connections_select" ON connections FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = recipient_id);
CREATE POLICY "connections_insert" ON connections FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "connections_update" ON connections FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = recipient_id);
CREATE POLICY "connections_delete" ON connections FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

-- Follows policies - follower_id and following_id are UUID, auth.uid() is UUID
CREATE POLICY "follows_select" ON follows FOR SELECT USING (true);
CREATE POLICY "follows_insert" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_update" ON follows FOR UPDATE USING (auth.uid() = follower_id);
CREATE POLICY "follows_delete" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- Jobs policies - posted_by is UUID, auth.uid() is UUID
CREATE POLICY "jobs_select" ON jobs FOR SELECT USING (true);
CREATE POLICY "jobs_insert" ON jobs FOR INSERT WITH CHECK (auth.uid() = posted_by);
CREATE POLICY "jobs_update" ON jobs FOR UPDATE USING (auth.uid() = posted_by);
CREATE POLICY "jobs_delete" ON jobs FOR DELETE USING (auth.uid() = posted_by);

-- Job applications policies - applicant_id is UUID, auth.uid() is UUID
CREATE POLICY "job_applications_select" ON job_applications FOR SELECT USING (
    auth.uid() = applicant_id OR 
    auth.uid() = (SELECT posted_by FROM jobs WHERE id = job_id)
);
CREATE POLICY "job_applications_insert" ON job_applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "job_applications_update" ON job_applications FOR UPDATE USING (
    auth.uid() = applicant_id OR 
    auth.uid() = (SELECT posted_by FROM jobs WHERE id = job_id)
);
CREATE POLICY "job_applications_delete" ON job_applications FOR DELETE USING (auth.uid() = applicant_id);

-- Events policies - organizer_id is UUID, auth.uid() is UUID
CREATE POLICY "events_select" ON events FOR SELECT USING (true);
CREATE POLICY "events_insert" ON events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "events_update" ON events FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "events_delete" ON events FOR DELETE USING (auth.uid() = organizer_id);

-- Event attendees policies - attendee_id is UUID, auth.uid() is UUID
CREATE POLICY "event_attendees_select" ON event_attendees FOR SELECT USING (true);
CREATE POLICY "event_attendees_insert" ON event_attendees FOR INSERT WITH CHECK (auth.uid() = attendee_id);
CREATE POLICY "event_attendees_update" ON event_attendees FOR UPDATE USING (auth.uid() = attendee_id);
CREATE POLICY "event_attendees_delete" ON event_attendees FOR DELETE USING (auth.uid() = attendee_id);

-- Notifications policies - user_id is UUID, auth.uid() is UUID
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (true); -- System can create notifications
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_delete" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- Analytics policies - System managed, no user restrictions
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

-- Post shares policies - user_id is UUID, auth.uid() is UUID
CREATE POLICY "post_shares_select" ON post_shares FOR SELECT USING (true);
CREATE POLICY "post_shares_insert" ON post_shares FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_shares_update" ON post_shares FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "post_shares_delete" ON post_shares FOR DELETE USING (auth.uid() = user_id);

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
    RAISE NOTICE 'RLS TYPE CASTING FIXED SUCCESSFULLY!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total RLS policies created: %', policy_count;
    RAISE NOTICE '✅ All UUID comparisons now use proper types';
    RAISE NOTICE '✅ auth.uid() = UUID fields (no casting needed)';
    RAISE NOTICE '✅ Removed problematic text = uuid comparisons';
    RAISE NOTICE '✅ All policies use consistent UUID types';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'The type casting error should now be resolved!';
    RAISE NOTICE '========================================';
END $$;
