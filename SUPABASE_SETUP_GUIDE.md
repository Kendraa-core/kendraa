# 🚀 Supabase Setup Guide for Kendraa

This comprehensive guide will walk you through setting up Supabase for the Kendraa healthcare networking platform.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Database Schema Setup](#database-schema-setup)
4. [Authentication Configuration](#authentication-configuration)
5. [Storage Configuration](#storage-configuration)
6. [Environment Variables](#environment-variables)
7. [Row Level Security (RLS)](#row-level-security-rls)
8. [Testing the Setup](#testing-the-setup)
9. [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

Before starting, ensure you have:

- [ ] A Supabase account (free tier available)
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] A code editor (VS Code recommended)

## 🏗️ Supabase Project Setup

### Step 1: Create a New Project

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Click "New Project"**
3. **Fill in project details:**
   - **Name:** `kendraa-healthcare`
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free tier (or Pro for production)

### Step 2: Wait for Setup

- Project creation takes 2-3 minutes
- You'll receive an email when ready

### Step 3: Get Project Credentials

1. **Go to Settings → API**
2. **Copy these values:**
   - Project URL
   - Anon Public Key
   - Service Role Key (keep secret!)

## 🗄️ Database Schema Setup

### Step 1: Create Tables

Run these SQL commands in the Supabase SQL Editor:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  headline TEXT,
  bio TEXT,
  location TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  user_type TEXT DEFAULT 'individual' CHECK (user_type IN ('individual', 'corporate')),
  specialization TEXT[],
  phone TEXT,
  website TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Experience table
CREATE TABLE experience (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  company_type TEXT CHECK (company_type IN ('hospital', 'clinic', 'research', 'pharmaceutical', 'other')),
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  current BOOLEAN DEFAULT FALSE,
  description TEXT,
  specialization TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Education table
CREATE TABLE education (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  school TEXT NOT NULL,
  degree TEXT NOT NULL,
  field TEXT,
  specialization TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  current BOOLEAN DEFAULT FALSE,
  description TEXT,
  gpa TEXT,
  honors TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts table
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  hashtags TEXT[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post likes table
CREATE TABLE post_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'support', 'insightful', 'celebrate', 'curious')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Comments table
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Connections table
CREATE TABLE connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(requester_id, recipient_id)
);

-- Events table
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  organizer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  location TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  image_url TEXT,
  max_attendees INTEGER,
  is_online BOOLEAN DEFAULT FALSE,
  meeting_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event registrations table
CREATE TABLE event_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Jobs table
CREATE TABLE jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  description TEXT NOT NULL,
  requirements TEXT[],
  salary_min INTEGER,
  salary_max INTEGER,
  job_type TEXT CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship')),
  remote_ok BOOLEAN DEFAULT FALSE,
  posted_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job applications table
CREATE TABLE job_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  cover_letter TEXT,
  resume_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected', 'hired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, applicant_id)
);

-- Notifications table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('connection_request', 'connection_accepted', 'post_like', 'post_comment', 'job_application', 'event_reminder', 'mention')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved posts table
CREATE TABLE saved_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);
```

### Step 2: Create Indexes for Performance

```sql
-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_connections_requester_id ON connections(requester_id);
CREATE INDEX idx_connections_recipient_id ON connections(recipient_id);
CREATE INDEX idx_events_organizer_id ON events(organizer_id);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_jobs_posted_by ON jobs(posted_by);
CREATE INDEX idx_jobs_is_active ON jobs(is_active);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
```

### Step 3: Create Functions and Triggers

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_experience_updated_at BEFORE UPDATE ON experience FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_education_updated_at BEFORE UPDATE ON education FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON job_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## 🔐 Authentication Configuration

### Step 1: Configure Auth Settings

1. **Go to Authentication → Settings**
2. **Configure the following:**

```yaml
Site URL: http://localhost:3000 (development)
Redirect URLs: 
  - http://localhost:3000/auth/callback
  - http://localhost:3000/reset-password
  - https://yourdomain.com/auth/callback (production)
  - https://yourdomain.com/reset-password (production)

Email Templates:
  - Confirm signup
  - Reset password
  - Magic link
  - Change email address
```

### Step 2: Enable Email Auth

1. **Go to Authentication → Providers**
2. **Enable Email provider**
3. **Configure settings:**
   - **Enable email confirmations:** ✅
   - **Enable secure email change:** ✅
   - **Enable double confirm changes:** ✅

### Step 3: Configure Password Reset

1. **Go to Authentication → Settings**
2. **Set password reset settings:**
   - **Enable password reset:** ✅
   - **Reset password redirect URL:** `http://localhost:3000/reset-password`
   - **Password reset token expiry:** 3600 (1 hour)

## 📁 Storage Configuration

### Step 1: Create Storage Buckets

1. **Go to Storage → Buckets**
2. **Create these buckets:**

```yaml
Bucket Name: public
Public: ✅
File size limit: 5MB
Allowed MIME types: image/*

Bucket Name: avatars
Public: ✅
File size limit: 2MB
Allowed MIME types: image/*

Bucket Name: covers
Public: ✅
File size limit: 5MB
Allowed MIME types: image/*

Bucket Name: posts
Public: ✅
File size limit: 10MB
Allowed MIME types: image/*, video/*
```

### Step 2: Configure Storage Policies

Run these SQL commands:

```sql
-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public read access to avatars
CREATE POLICY "Public read access to avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users can update own avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete own avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Similar policies for other buckets...
```

## 🔧 Environment Variables

### Step 1: Create .env.local

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Service Role Key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# External APIs (if using)
NEXT_PUBLIC_NEWS_API_KEY=your_news_api_key
```

### Step 2: Get Your Keys

1. **Go to Settings → API**
2. **Copy the values:**
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Public Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY`

## 🛡️ Row Level Security (RLS)

### Step 1: Enable RLS

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;
```

### Step 2: Create Security Policies

```sql
-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Posts policies
CREATE POLICY "Users can view all posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = author_id);

-- Post likes policies
CREATE POLICY "Users can view all likes" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike own likes" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- Connections policies
CREATE POLICY "Users can view own connections" ON connections FOR SELECT USING (
  auth.uid() = requester_id OR auth.uid() = recipient_id
);
CREATE POLICY "Users can create connection requests" ON connections FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update own connections" ON connections FOR UPDATE USING (
  auth.uid() = requester_id OR auth.uid() = recipient_id
);

-- Events policies
CREATE POLICY "Users can view all events" ON events FOR SELECT USING (true);
CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Users can update own events" ON events FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Users can delete own events" ON events FOR DELETE USING (auth.uid() = organizer_id);

-- Jobs policies
CREATE POLICY "Users can view all active jobs" ON jobs FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create jobs" ON jobs FOR INSERT WITH CHECK (auth.uid() = posted_by);
CREATE POLICY "Users can update own jobs" ON jobs FOR UPDATE USING (auth.uid() = posted_by);
CREATE POLICY "Users can delete own jobs" ON jobs FOR DELETE USING (auth.uid() = posted_by);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
```

## 🧪 Testing the Setup

### Step 1: Test Authentication

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Test sign up:**
   - Go to `/signup`
   - Create a new account
   - Check email confirmation

3. **Test sign in:**
   - Go to `/signin`
   - Sign in with your account

4. **Test password reset:**
   - Go to `/forgot-password`
   - Enter your email
   - Check email for reset link

### Step 2: Test Database Operations

1. **Check profile creation:**
   - After signup, verify profile is created in Supabase dashboard

2. **Test profile updates:**
   - Update profile information
   - Verify changes in database

3. **Test file uploads:**
   - Upload profile picture
   - Verify file appears in storage bucket

### Step 3: Test RLS Policies

1. **Create test data:**
   - Create posts, connections, etc.

2. **Verify access control:**
   - Users can only edit their own content
   - Public content is viewable by all

## 🔍 Troubleshooting

### Common Issues

#### 1. Authentication Errors

**Problem:** "Invalid JWT" or "User not found"
**Solution:**
- Check environment variables are correct
- Verify Supabase URL and keys
- Clear browser storage and try again

#### 2. RLS Policy Errors

**Problem:** "New row violates row-level security policy"
**Solution:**
- Check RLS policies are correctly configured
- Verify user authentication state
- Check policy conditions match your use case

#### 3. Storage Upload Errors

**Problem:** "Storage bucket not found" or "Permission denied"
**Solution:**
- Verify bucket exists and is public
- Check storage policies are configured
- Verify file size and type restrictions

#### 4. Database Connection Issues

**Problem:** "Connection timeout" or "Database unavailable"
**Solution:**
- Check Supabase project status
- Verify network connectivity
- Check if project is paused (free tier)

### Debug Commands

```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test Supabase connection
curl -X GET "https://your-project.supabase.co/rest/v1/" \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"

# Check database status
curl -X GET "https://your-project.supabase.co/rest/v1/profiles?select=*&limit=1" \
  -H "apikey: your-anon-key"
```

### Getting Help

1. **Supabase Documentation:** https://supabase.com/docs
2. **Supabase Community:** https://github.com/supabase/supabase/discussions
3. **Supabase Discord:** https://discord.supabase.com

## 🚀 Production Deployment

### Step 1: Update Environment Variables

```env
# Production environment
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

### Step 2: Update Auth Settings

1. **Go to Authentication → Settings**
2. **Update Site URL:** `https://yourdomain.com`
3. **Add production redirect URLs:**
   - `https://yourdomain.com/auth/callback`
   - `https://yourdomain.com/reset-password`

### Step 3: Database Backups

1. **Go to Settings → Database**
2. **Enable Point-in-time Recovery** (Pro plan)
3. **Set up automated backups**

### Step 4: Monitoring

1. **Go to Settings → Logs**
2. **Monitor:**
   - Authentication logs
   - Database performance
   - Storage usage
   - API requests

## 📚 Additional Resources

- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage API Reference](https://supabase.com/docs/reference/javascript/storage-createbucket)

---

## ✅ Checklist

- [ ] Supabase project created
- [ ] Database schema set up
- [ ] Authentication configured
- [ ] Storage buckets created
- [ ] RLS policies implemented
- [ ] Environment variables set
- [ ] Authentication flow tested
- [ ] File upload tested
- [ ] Production environment configured
- [ ] Monitoring set up

Congratulations! Your Supabase setup is complete and ready for the Kendraa healthcare networking platform! 🎉
