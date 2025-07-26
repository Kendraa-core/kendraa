export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  avatar_url?: string;
  cover_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  headline?: string;
  industry?: string;
  skills?: string[];
  experiences?: Experience[];
  education?: Education[];
  hashtags?: string[];
  current_organization_id?: string;
  current_organization_title?: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location?: string;
  start_date: string;
  end_date?: string;
  current: boolean;
  description?: string;
  organization_id?: string;
  organization?: Organization;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  start_date: string;
  end_date?: string;
  current: boolean;
  description?: string;
  organization_id?: string;
  organization?: Organization;
}

export interface Organization {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  logo_url?: string;
  cover_url?: string;
  website?: string;
  industry?: string;
  size?: string;
  type: 'company' | 'hospital' | 'educational';
  description?: string;
  headquarters?: string;
  founded_year?: number;
  specialties?: string[];
  verified: boolean;
  stats?: OrganizationStats;
  is_admin?: boolean;
  is_following?: boolean;
}

export interface OrganizationAdmin {
  id: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor';
  organization?: Organization;
  user?: Profile;
}

export interface OrganizationFollower {
  id: string;
  created_at: string;
  organization_id: string;
  user_id: string;
  organization?: Organization;
  user?: Profile;
}

export interface OrganizationPost {
  id: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
  author_id: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  organization?: Organization;
  author?: Profile;
}

export interface OrganizationStats {
  followers_count: number;
  employees_count: number;
  posts_count: number;
}

export interface Post {
  id: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  content: string;
  image_url: string | null;
  author?: Profile;
  likes_count?: number;
  comments_count?: number;
  has_liked?: boolean;
}

export interface Connection {
  id: string;
  created_at: string;
  updated_at: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  requester?: Profile;
  recipient?: Profile;
}

export interface Notification {
  id: string;
  created_at: string;
  type: 'connection_request' | 'connection_accepted' | 'post_like' | 'post_comment';
  read: boolean;
  recipient_id: string;
  actor_id: string;
  post_id?: string;
  connection_id?: string;
  actor?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    headline?: string;
  } | null;
  post?: {
    id: string;
    content: string;
    image_url?: string;
  } | null;
  connection?: {
    id: string;
    status: string;
    requester_id: string;
    recipient_id: string;
  } | null;
}

export interface Comment {
  id: string;
  created_at: string;
  updated_at: string;
  post_id: string;
  author_id: string;
  content: string;
  author?: Profile;
}

export interface Like {
  id: string;
  created_at: string;
  post_id: string;
  user_id: string;
  user?: Profile;
} 