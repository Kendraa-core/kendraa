-- Enable RLS
alter table auth.users enable row level security;

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  full_name text,
  headline text,
  bio text,
  location text,
  avatar_url text,
  cover_url text,
  industry text,
  skills text[],
  experiences jsonb[],
  education jsonb[],
  hashtags text[]
);

-- Create connections table
create table public.connections (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  requester_id uuid references auth.users on delete cascade,
  recipient_id uuid references auth.users on delete cascade,
  status text check (status in ('pending', 'accepted', 'rejected')),
  unique (requester_id, recipient_id)
);

-- Create posts table
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  author_id uuid references auth.users on delete cascade,
  content text,
  image_url text
);

-- Create notifications table
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now(),
  recipient_id uuid references auth.users on delete cascade,
  actor_id uuid references auth.users on delete cascade,
  type text check (type in ('connection_request', 'connection_accepted', 'post_like', 'post_comment')),
  read boolean default false,
  data jsonb,
  post_id uuid references public.posts on delete cascade,
  connection_id uuid references public.connections on delete cascade
);

-- Create comments table
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  post_id uuid references public.posts on delete cascade,
  author_id uuid references auth.users on delete cascade,
  content text
);

-- Create likes table
create table public.likes (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now(),
  post_id uuid references public.posts on delete cascade,
  user_id uuid references auth.users on delete cascade,
  unique (post_id, user_id)
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.connections enable row level security;
alter table public.posts enable row level security;
alter table public.notifications enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Connections policies
create policy "Users can view their own connections"
  on public.connections for select
  using (auth.uid() = requester_id or auth.uid() = recipient_id);

create policy "Users can create connection requests"
  on public.connections for insert
  with check (auth.uid() = requester_id);

create policy "Users can update their received connections"
  on public.connections for update
  using (auth.uid() = recipient_id);

create policy "Users can delete their connections"
  on public.connections for delete
  using (auth.uid() = requester_id or auth.uid() = recipient_id);

-- Posts policies
create policy "Posts are viewable by everyone"
  on public.posts for select
  using (true);

create policy "Users can create posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "Users can update own posts"
  on public.posts for update
  using (auth.uid() = author_id);

create policy "Users can delete own posts"
  on public.posts for delete
  using (auth.uid() = author_id);

-- Notifications policies
create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = recipient_id);

create policy "System can create notifications"
  on public.notifications for insert
  with check (true);

create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = recipient_id);

create policy "Users can delete own notifications"
  on public.notifications for delete
  using (auth.uid() = recipient_id);

-- Comments policies
create policy "Comments are viewable by everyone"
  on public.comments for select
  using (true);

create policy "Users can create comments"
  on public.comments for insert
  with check (auth.uid() = author_id);

create policy "Users can update own comments"
  on public.comments for update
  using (auth.uid() = author_id);

create policy "Users can delete own comments"
  on public.comments for delete
  using (auth.uid() = author_id);

-- Likes policies
create policy "Likes are viewable by everyone"
  on public.likes for select
  using (true);

create policy "Users can create likes"
  on public.likes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own likes"
  on public.likes for delete
  using (auth.uid() = user_id);

-- Functions
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

-- Triggers
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to handle notifications
create or replace function public.handle_connection_request()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (TG_OP = 'INSERT') then
    insert into public.notifications (recipient_id, actor_id, type, connection_id)
    values (
      NEW.recipient_id,
      NEW.requester_id,
      'connection_request',
      NEW.id
    );
  elsif (TG_OP = 'UPDATE' and NEW.status = 'accepted') then
    insert into public.notifications (recipient_id, actor_id, type, connection_id)
    values (
      NEW.requester_id,
      NEW.recipient_id,
      'connection_accepted',
      NEW.id
    );
  end if;
  return NEW;
end;
$$;

-- Trigger for connection notifications
create trigger on_connection_change
  after insert or update on public.connections
  for each row execute procedure public.handle_connection_request();

-- Function to handle post interactions
create or replace function public.handle_post_interaction()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  post_author_id uuid;
begin
  -- Get post author
  select author_id into post_author_id
  from public.posts
  where id = NEW.post_id;

  -- Don't notify if the user is interacting with their own post
  if post_author_id = NEW.author_id or post_author_id = NEW.user_id then
    return NEW;
  end if;

  -- Create notification
  insert into public.notifications (
    recipient_id,
    actor_id,
    type,
    post_id
  )
  values (
    post_author_id,
    CASE
      WHEN TG_TABLE_NAME = 'comments' THEN NEW.author_id
      ELSE NEW.user_id
    END,
    CASE
      WHEN TG_TABLE_NAME = 'comments' THEN 'post_comment'
      ELSE 'post_like'
    END,
    NEW.post_id
  );

  return NEW;
end;
$$;

-- Triggers for post interactions
create trigger on_comment_created
  after insert on public.comments
  for each row execute procedure public.handle_post_interaction();

create trigger on_like_created
  after insert on public.likes
  for each row execute procedure public.handle_post_interaction();

-- Create organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  name TEXT NOT NULL,
  logo_url TEXT,
  cover_url TEXT,
  website TEXT,
  industry TEXT,
  size TEXT,
  type TEXT NOT NULL CHECK (type IN ('company', 'hospital', 'educational')),
  description TEXT,
  headquarters TEXT,
  founded_year INTEGER,
  specialties TEXT[],
  verified BOOLEAN DEFAULT FALSE
);

-- Create organization_admins table for managing admin access
CREATE TABLE organization_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor')),
  UNIQUE(organization_id, user_id)
);

-- Create organization_followers table
CREATE TABLE organization_followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(organization_id, user_id)
);

-- Create organization_posts table
CREATE TABLE organization_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0
);

-- Add organization_id to profiles for employees
ALTER TABLE profiles
ADD COLUMN current_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
ADD COLUMN current_organization_title TEXT;

-- Add organization_id to experiences for work history
ALTER TABLE experiences
ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- Add organization_id to education for educational institutions
ALTER TABLE education
ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- Create RLS policies for organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations are viewable by everyone"
ON organizations FOR SELECT
USING (true);

CREATE POLICY "Organizations can be created by authenticated users"
ON organizations FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Organizations can be updated by admins"
ON organizations FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_admins
    WHERE organization_id = organizations.id
    AND user_id = auth.uid()
  )
);

-- Create RLS policies for organization_admins
ALTER TABLE organization_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization admins are viewable by everyone"
ON organization_admins FOR SELECT
USING (true);

CREATE POLICY "Organization admins can be created by organization owners"
ON organization_admins FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_admins
    WHERE organization_id = NEW.organization_id
    AND user_id = auth.uid()
    AND role = 'owner'
  )
);

-- Create RLS policies for organization_followers
ALTER TABLE organization_followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization followers are viewable by everyone"
ON organization_followers FOR SELECT
USING (true);

CREATE POLICY "Users can follow/unfollow organizations"
ON organization_followers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow organizations"
ON organization_followers FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create RLS policies for organization_posts
ALTER TABLE organization_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization posts are viewable by everyone"
ON organization_posts FOR SELECT
    USING (true);

CREATE POLICY "Organization posts can be created by admins"
ON organization_posts FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_admins
    WHERE organization_id = NEW.organization_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Organization posts can be updated by post author or admins"
ON organization_posts FOR UPDATE
TO authenticated
USING (
  auth.uid() = author_id OR
  EXISTS (
    SELECT 1 FROM organization_admins
    WHERE organization_id = organization_posts.organization_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Organization posts can be deleted by post author or admins"
ON organization_posts FOR DELETE
TO authenticated
USING (
  auth.uid() = author_id OR
  EXISTS (
    SELECT 1 FROM organization_admins
    WHERE organization_id = organization_posts.organization_id
    AND user_id = auth.uid()
  )
);

-- Create functions for organization stats
CREATE OR REPLACE FUNCTION get_organization_stats(org_id UUID)
RETURNS TABLE (
  followers_count BIGINT,
  employees_count BIGINT,
  posts_count BIGINT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM organization_followers WHERE organization_id = org_id),
    (SELECT COUNT(*) FROM profiles WHERE current_organization_id = org_id),
    (SELECT COUNT(*) FROM organization_posts WHERE organization_id = org_id);
END;
$$; 