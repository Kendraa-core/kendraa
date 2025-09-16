-- Analytics Tracking Tables for Kendraa
-- This SQL script creates the necessary tables for post analytics tracking

-- 1. Post Analytics Summary Table
CREATE TABLE IF NOT EXISTS post_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    impressions INTEGER DEFAULT 0,
    unique_impressions INTEGER DEFAULT 0,
    profile_views INTEGER DEFAULT 0,
    followers_gained INTEGER DEFAULT 0,
    video_views INTEGER DEFAULT 0,
    total_watch_time INTEGER DEFAULT 0, -- in seconds
    average_watch_time DECIMAL(5,2) DEFAULT 0, -- in seconds
    shares_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    
    -- Ensure one analytics record per post
    UNIQUE(post_id)
);

-- 2. Post Impressions Tracking Table
CREATE TABLE IF NOT EXISTS post_impressions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL for anonymous users
    source VARCHAR(20) NOT NULL CHECK (source IN ('feed', 'profile', 'search', 'direct', 'share')),
    device_type VARCHAR(10) NOT NULL CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
    location VARCHAR(255) -- URL or location where impression occurred
);

-- 3. Post Views Tracking Table
CREATE TABLE IF NOT EXISTS post_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL for anonymous users
    view_duration INTEGER DEFAULT 0, -- in seconds
    completion_rate DECIMAL(5,2) DEFAULT 0, -- percentage (0-100)
    device_type VARCHAR(10) NOT NULL CHECK (device_type IN ('desktop', 'mobile', 'tablet'))
);

-- 4. Post Shares Tracking Table
CREATE TABLE IF NOT EXISTS post_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    share_type VARCHAR(20) NOT NULL CHECK (share_type IN ('native', 'copy_link', 'external')),
    platform VARCHAR(50), -- for external shares (linkedin, twitter, email, etc.)
    recipient_count INTEGER -- for native shares (number of recipients)
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_post_analytics_post_id ON post_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_post_analytics_updated_at ON post_analytics(updated_at);

-- Indexes for post_impressions
CREATE INDEX IF NOT EXISTS idx_post_impressions_post_id ON post_impressions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_impressions_user_id ON post_impressions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_impressions_created_at ON post_impressions(created_at);
CREATE INDEX IF NOT EXISTS idx_post_impressions_source ON post_impressions(source);

-- Indexes for post_views
CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_user_id ON post_views(user_id);
CREATE INDEX IF NOT EXISTS idx_post_views_created_at ON post_views(created_at);
CREATE INDEX IF NOT EXISTS idx_post_views_duration ON post_views(view_duration);

-- Indexes for post_shares
CREATE INDEX IF NOT EXISTS idx_post_shares_post_id ON post_shares(post_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_user_id ON post_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_created_at ON post_shares(created_at);
CREATE INDEX IF NOT EXISTS idx_post_shares_platform ON post_shares(platform);

-- 6. Create triggers to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to post_analytics table
DROP TRIGGER IF EXISTS update_post_analytics_updated_at ON post_analytics;
CREATE TRIGGER update_post_analytics_updated_at
    BEFORE UPDATE ON post_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Create a function to automatically create analytics record when a post is created
CREATE OR REPLACE FUNCTION create_post_analytics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO post_analytics (post_id, created_at, updated_at)
    VALUES (NEW.id, NOW(), NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to posts table
DROP TRIGGER IF EXISTS create_analytics_on_post_insert ON posts;
CREATE TRIGGER create_analytics_on_post_insert
    AFTER INSERT ON posts
    FOR EACH ROW
    EXECUTE FUNCTION create_post_analytics();

-- 8. Create a function to update analytics summary when impressions are tracked
CREATE OR REPLACE FUNCTION update_impressions_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE post_analytics 
    SET 
        impressions = impressions + 1,
        unique_impressions = (
            SELECT COUNT(DISTINCT user_id) 
            FROM post_impressions 
            WHERE post_id = NEW.post_id AND user_id IS NOT NULL
        ) + (
            SELECT COUNT(*) 
            FROM post_impressions 
            WHERE post_id = NEW.post_id AND user_id IS NULL
        ),
        updated_at = NOW()
    WHERE post_id = NEW.post_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to post_impressions table
DROP TRIGGER IF EXISTS update_impressions_on_insert ON post_impressions;
CREATE TRIGGER update_impressions_on_insert
    AFTER INSERT ON post_impressions
    FOR EACH ROW
    EXECUTE FUNCTION update_impressions_count();

-- 9. Create a function to update analytics summary when views are tracked
CREATE OR REPLACE FUNCTION update_views_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE post_analytics 
    SET 
        video_views = video_views + 1,
        total_watch_time = total_watch_time + NEW.view_duration,
        average_watch_time = (
            SELECT AVG(view_duration) 
            FROM post_views 
            WHERE post_id = NEW.post_id
        ),
        updated_at = NOW()
    WHERE post_id = NEW.post_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to post_views table
DROP TRIGGER IF EXISTS update_views_on_insert ON post_views;
CREATE TRIGGER update_views_on_insert
    AFTER INSERT ON post_views
    FOR EACH ROW
    EXECUTE FUNCTION update_views_count();

-- 10. Create a function to update analytics summary when shares are tracked
CREATE OR REPLACE FUNCTION update_shares_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE post_analytics 
    SET 
        shares_count = shares_count + 1,
        updated_at = NOW()
    WHERE post_id = NEW.post_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to post_shares table
DROP TRIGGER IF EXISTS update_shares_on_insert ON post_shares;
CREATE TRIGGER update_shares_on_insert
    AFTER INSERT ON post_shares
    FOR EACH ROW
    EXECUTE FUNCTION update_shares_count();

-- 11. Create a function to update saves count when posts are saved
CREATE OR REPLACE FUNCTION update_saves_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE post_analytics 
        SET 
            saves_count = saves_count + 1,
            updated_at = NOW()
        WHERE post_id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE post_analytics 
        SET 
            saves_count = saves_count - 1,
            updated_at = NOW()
        WHERE post_id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply the trigger to saved_posts table
DROP TRIGGER IF EXISTS update_saves_on_saved_posts_change ON saved_posts;
CREATE TRIGGER update_saves_on_saved_posts_change
    AFTER INSERT OR DELETE ON saved_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_saves_count();

-- 12. Create views for easier analytics queries
CREATE OR REPLACE VIEW post_analytics_summary AS
SELECT 
    pa.post_id,
    p.content,
    p.created_at as post_created_at,
    pa.impressions,
    pa.unique_impressions,
    pa.profile_views,
    pa.followers_gained,
    pa.video_views,
    pa.total_watch_time,
    pa.average_watch_time,
    pa.shares_count,
    pa.saves_count,
    p.likes_count,
    p.comments_count,
    p.shares_count as post_shares_count,
    pa.updated_at as analytics_updated_at
FROM post_analytics pa
JOIN posts p ON pa.post_id = p.id;

-- 13. Create a view for impression analytics
CREATE OR REPLACE VIEW post_impression_analytics AS
SELECT 
    post_id,
    COUNT(*) as total_impressions,
    COUNT(DISTINCT user_id) as unique_user_impressions,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as anonymous_impressions,
    COUNT(CASE WHEN source = 'feed' THEN 1 END) as feed_impressions,
    COUNT(CASE WHEN source = 'profile' THEN 1 END) as profile_impressions,
    COUNT(CASE WHEN source = 'search' THEN 1 END) as search_impressions,
    COUNT(CASE WHEN source = 'direct' THEN 1 END) as direct_impressions,
    COUNT(CASE WHEN source = 'share' THEN 1 END) as share_impressions,
    COUNT(CASE WHEN device_type = 'desktop' THEN 1 END) as desktop_impressions,
    COUNT(CASE WHEN device_type = 'mobile' THEN 1 END) as mobile_impressions,
    COUNT(CASE WHEN device_type = 'tablet' THEN 1 END) as tablet_impressions
FROM post_impressions
GROUP BY post_id;

-- 14. Create a view for view analytics
CREATE OR REPLACE VIEW post_view_analytics AS
SELECT 
    post_id,
    COUNT(*) as total_views,
    COUNT(DISTINCT user_id) as unique_user_views,
    AVG(view_duration) as avg_view_duration,
    AVG(completion_rate) as avg_completion_rate,
    MAX(view_duration) as max_view_duration,
    MIN(view_duration) as min_view_duration,
    COUNT(CASE WHEN device_type = 'desktop' THEN 1 END) as desktop_views,
    COUNT(CASE WHEN device_type = 'mobile' THEN 1 END) as mobile_views,
    COUNT(CASE WHEN device_type = 'tablet' THEN 1 END) as tablet_views
FROM post_views
GROUP BY post_id;

-- 15. Create a view for share analytics
CREATE OR REPLACE VIEW post_share_analytics AS
SELECT 
    post_id,
    COUNT(*) as total_shares,
    COUNT(DISTINCT user_id) as unique_user_shares,
    COUNT(CASE WHEN share_type = 'native' THEN 1 END) as native_shares,
    COUNT(CASE WHEN share_type = 'copy_link' THEN 1 END) as copy_link_shares,
    COUNT(CASE WHEN share_type = 'external' THEN 1 END) as external_shares,
    COUNT(CASE WHEN platform = 'linkedin' THEN 1 END) as linkedin_shares,
    COUNT(CASE WHEN platform = 'twitter' THEN 1 END) as twitter_shares,
    COUNT(CASE WHEN platform = 'email' THEN 1 END) as email_shares,
    AVG(recipient_count) as avg_recipients_per_share
FROM post_shares
GROUP BY post_id;

-- 16. Grant necessary permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON post_analytics TO your_app_user;
-- GRANT SELECT, INSERT ON post_impressions TO your_app_user;
-- GRANT SELECT, INSERT ON post_views TO your_app_user;
-- GRANT SELECT, INSERT ON post_shares TO your_app_user;
-- GRANT SELECT ON post_analytics_summary TO your_app_user;
-- GRANT SELECT ON post_impression_analytics TO your_app_user;
-- GRANT SELECT ON post_view_analytics TO your_app_user;
-- GRANT SELECT ON post_share_analytics TO your_app_user;

-- 17. Create cleanup function for old analytics data (optional)
CREATE OR REPLACE FUNCTION cleanup_old_analytics_data(days_to_keep INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete old impressions (keep only specified days)
    DELETE FROM post_impressions 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete old views
    DELETE FROM post_views 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    -- Delete old shares
    DELETE FROM post_shares 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- 18. Create a function to get comprehensive analytics for a post
CREATE OR REPLACE FUNCTION get_post_analytics(post_uuid UUID)
RETURNS TABLE (
    post_id UUID,
    impressions BIGINT,
    unique_impressions BIGINT,
    profile_views INTEGER,
    followers_gained INTEGER,
    video_views INTEGER,
    total_watch_time INTEGER,
    average_watch_time DECIMAL,
    shares_count INTEGER,
    saves_count INTEGER,
    likes_count INTEGER,
    comments_count INTEGER,
    post_shares_count INTEGER,
    feed_impressions BIGINT,
    profile_impressions BIGINT,
    search_impressions BIGINT,
    direct_impressions BIGINT,
    share_impressions BIGINT,
    desktop_impressions BIGINT,
    mobile_impressions BIGINT,
    tablet_impressions BIGINT,
    total_views BIGINT,
    unique_user_views BIGINT,
    avg_view_duration DECIMAL,
    avg_completion_rate DECIMAL,
    total_shares BIGINT,
    unique_user_shares BIGINT,
    native_shares BIGINT,
    copy_link_shares BIGINT,
    external_shares BIGINT,
    linkedin_shares BIGINT,
    twitter_shares BIGINT,
    email_shares BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pa.post_id,
        pa.impressions,
        pa.unique_impressions,
        pa.profile_views,
        pa.followers_gained,
        pa.video_views,
        pa.total_watch_time,
        pa.average_watch_time,
        pa.shares_count,
        pa.saves_count,
        p.likes_count,
        p.comments_count,
        p.shares_count as post_shares_count,
        COALESCE(pia.feed_impressions, 0),
        COALESCE(pia.profile_impressions, 0),
        COALESCE(pia.search_impressions, 0),
        COALESCE(pia.direct_impressions, 0),
        COALESCE(pia.share_impressions, 0),
        COALESCE(pia.desktop_impressions, 0),
        COALESCE(pia.mobile_impressions, 0),
        COALESCE(pia.tablet_impressions, 0),
        COALESCE(pva.total_views, 0),
        COALESCE(pva.unique_user_views, 0),
        COALESCE(pva.avg_view_duration, 0),
        COALESCE(pva.avg_completion_rate, 0),
        COALESCE(psa.total_shares, 0),
        COALESCE(psa.unique_user_shares, 0),
        COALESCE(psa.native_shares, 0),
        COALESCE(psa.copy_link_shares, 0),
        COALESCE(psa.external_shares, 0),
        COALESCE(psa.linkedin_shares, 0),
        COALESCE(psa.twitter_shares, 0),
        COALESCE(psa.email_shares, 0)
    FROM post_analytics pa
    JOIN posts p ON pa.post_id = p.id
    LEFT JOIN post_impression_analytics pia ON pa.post_id = pia.post_id
    LEFT JOIN post_view_analytics pva ON pa.post_id = pva.post_id
    LEFT JOIN post_share_analytics psa ON pa.post_id = psa.post_id
    WHERE pa.post_id = post_uuid;
END;
$$ language 'plpgsql';

-- 19. Add comments for documentation
COMMENT ON TABLE post_analytics IS 'Summary analytics data for each post';
COMMENT ON TABLE post_impressions IS 'Detailed tracking of post impressions with source and device info';
COMMENT ON TABLE post_views IS 'Detailed tracking of post views with duration and completion data';
COMMENT ON TABLE post_shares IS 'Tracking of post sharing activity across platforms';

COMMENT ON COLUMN post_analytics.impressions IS 'Total number of times the post was displayed';
COMMENT ON COLUMN post_analytics.unique_impressions IS 'Number of unique users who saw the post';
COMMENT ON COLUMN post_analytics.profile_views IS 'Number of profile views generated from this post';
COMMENT ON COLUMN post_analytics.followers_gained IS 'Number of new followers gained from this post';
COMMENT ON COLUMN post_analytics.video_views IS 'Number of detailed views (clicks) on the post';
COMMENT ON COLUMN post_analytics.total_watch_time IS 'Total time spent viewing the post in seconds';
COMMENT ON COLUMN post_analytics.average_watch_time IS 'Average time spent viewing the post in seconds';

-- 20. Create composite indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_post_impressions_post_created ON post_impressions(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_post_views_post_created ON post_views(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_post_shares_post_created ON post_shares(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_post_impressions_user_created ON post_impressions(user_id, created_at) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_post_views_user_created ON post_views(user_id, created_at) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_post_shares_user_created ON post_shares(user_id, created_at);

-- End of analytics tables creation script
