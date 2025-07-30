export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      posts: {
        Row: Post;
        Insert: Omit<Post, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Post, 'id' | 'created_at' | 'updated_at'>>;
      };
      post_comments: {
        Row: PostComment;
        Insert: Omit<PostComment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PostComment, 'id' | 'created_at' | 'updated_at'>>;
      };
      post_likes: {
        Row: PostLike;
        Insert: Omit<PostLike, 'id' | 'created_at'>;
        Update: Partial<Omit<PostLike, 'id' | 'created_at'>>;
      };
      connections: {
        Row: Connection;
        Insert: Omit<Connection, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Connection, 'id' | 'created_at' | 'updated_at'>>;
      };
      institutions: {
        Row: Institution;
        Insert: Omit<Institution, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Institution, 'id' | 'created_at' | 'updated_at'>>;
      };
      jobs: {
        Row: Job;
        Insert: Omit<Job, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Job, 'id' | 'created_at' | 'updated_at'>>;
      };
      job_applications: {
        Row: JobApplication;
        Insert: Omit<JobApplication, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<JobApplication, 'id' | 'created_at' | 'updated_at'>>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at'>>;
      };
      event_attendees: {
        Row: EventAttendee;
        Insert: Omit<EventAttendee, 'id' | 'created_at'>;
        Update: Partial<Omit<EventAttendee, 'id' | 'created_at'>>;
      };
      experiences: {
        Row: Experience;
        Insert: Omit<Experience, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Experience, 'id' | 'created_at' | 'updated_at'>>;
      };
      education: {
        Row: Education;
        Insert: Omit<Education, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Education, 'id' | 'created_at' | 'updated_at'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>;
      };
    };
  };
}

export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  banner_url: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  phone: string | null;
  specialization: string[] | null; // Changed from skills to specialization
  is_premium: boolean;
  profile_views: number;
  user_type: 'individual' | 'institution'; // Added user type
}

export interface Institution {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  type: 'hospital' | 'clinic' | 'research_center' | 'university' | 'pharmaceutical' | 'medical_device' | 'other';
  description: string | null;
  location: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  banner_url: string | null;
  specialties: string[] | null;
  license_number: string | null;
  accreditation: string[] | null;
  established_year: number | null;
  size: 'small' | 'medium' | 'large' | 'enterprise' | null;
  verified: boolean;
  admin_user_id: string; // Foreign key to profiles table
}

export interface Post {
  id: string;
  created_at: string;
  updated_at: string;
  content: string;
  author_id: string;
  author_type: 'individual' | 'institution';
  visibility: 'public' | 'connections' | 'private';
  image_url: string | null;
  images: string[] | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
}

export interface PostComment {
  id: string;
  created_at: string;
  updated_at: string;
  post_id: string;
  author_id: string;
  author_type: 'individual' | 'institution';
  content: string;
  parent_id: string | null; // For nested comments
  likes_count: number;
}

export interface PostLike {
  id: string;
  created_at: string;
  post_id: string;
  user_id: string;
  user_type: 'individual' | 'institution';
}

export interface Connection {
  id: string;
  created_at: string;
  updated_at: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Job {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  requirements: string[] | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  location: string | null;
  job_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'volunteer';
  experience_level: 'entry' | 'mid' | 'senior' | 'executive';
  specializations: string[] | null;
  company_id: string; // Foreign key to institutions table
  posted_by: string; // Foreign key to profiles table
  status: 'active' | 'closed' | 'draft';
  application_deadline: string | null;
  applications_count: number;
}

export interface JobApplication {
  id: string;
  created_at: string;
  updated_at: string;
  job_id: string;
  applicant_id: string;
  cover_letter: string | null;
  resume_url: string | null;
  status: 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes: string | null;
}

export interface Event {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string | null;
  venue: string | null;
  event_type: 'conference' | 'workshop' | 'seminar' | 'webinar' | 'networking' | 'training';
  specializations: string[] | null;
  organizer_id: string; // Can be individual or institution
  organizer_type: 'individual' | 'institution';
  max_attendees: number | null;
  registration_fee: number | null;
  currency: string | null;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  is_virtual: boolean;
  meeting_link: string | null;
  banner_url: string | null;
  attendees_count: number;
}

export interface EventAttendee {
  id: string;
  created_at: string;
  event_id: string;
  attendee_id: string;
  attendee_type: 'individual' | 'institution';
  status: 'registered' | 'attended' | 'cancelled';
  registration_date: string;
}

export interface Experience {
  id: string;
  created_at: string;
  updated_at: string;
  profile_id: string;
  title: string;
  company: string;
  company_type: 'hospital' | 'clinic' | 'research' | 'pharmaceutical' | 'other' | null;
  location: string | null;
  start_date: string;
  end_date: string | null;
  current: boolean;
  description: string | null;
  specialization: string[] | null; // Changed from skills to specialization
}

export interface Education {
  id: string;
  created_at: string;
  updated_at: string;
  profile_id: string;
  school: string;
  degree: string;
  field: string | null;
  specialization: string | null; // Medical specialization
  start_date: string;
  end_date: string | null;
  current: boolean;
  description: string | null;
  gpa: string | null;
  honors: string[] | null;
}

export interface Notification {
  id: string;
  created_at: string;
  user_id: string;
  type: 'connection_request' | 'connection_accepted' | 'post_like' | 'post_comment' | 'job_application' | 'event_reminder' | 'mention';
  title: string;
  message: string;
  read: boolean;
  data: Record<string, unknown> | null;
  action_url: string | null;
}

// Helper types
export interface PostWithAuthor extends Post {
  author: Profile | Institution;
}

export interface CommentWithAuthor extends PostComment {
  author: Profile | Institution;
}

export interface ConnectionWithProfile extends Connection {
  requester: Profile;
  recipient: Profile;
}

export interface JobWithCompany extends Job {
  company: Institution;
  posted_by_user: Profile;
}

export interface EventWithOrganizer extends Event {
  organizer: Profile | Institution;
} 