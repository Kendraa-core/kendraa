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
      comment_likes: {
        Row: CommentLike;
        Insert: Omit<CommentLike, 'id' | 'created_at'>;
        Update: Partial<Omit<CommentLike, 'id' | 'created_at'>>;
      };
      saved_posts: {
        Row: SavedPost;
        Insert: Omit<SavedPost, 'id' | 'created_at'>;
        Update: Partial<Omit<SavedPost, 'id' | 'created_at'>>;
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
  country: string | null;
  website: string | null;
  phone: string | null;
  specialization: string[] | null;
  is_premium: boolean;
  onboarding_completed: boolean;

  user_type: 'individual' | 'institution';
  profile_type: 'individual' | 'institution';
  
  // Enhanced Medical Professional Fields (Optional for backward compatibility)
  medical_license?: {
    license_number: string;
    issuing_authority: string;
    issue_date: string;
    expiry_date: string;
    status: 'active' | 'expired' | 'suspended' | 'pending_verification';
  };
  medical_degrees?: {
    degree: string;
    institution: string;
    graduation_year: number;
    verification_status: 'verified' | 'pending' | 'unverified';
  }[];
  certifications?: {
    name: string;
    issuing_body: string;
    issue_date: string;
    expiry_date?: string;
    certificate_id?: string;
    verification_status: 'verified' | 'pending' | 'unverified';
  }[];
  research_papers?: {
    title: string;
    journal: string;
    publication_date: string;
    doi?: string;
    pubmed_id?: string;
    authors: string[];
    is_first_author: boolean;
  }[];
  languages_spoken?: string[];
  languages?: string[];
  skills?: string[];
  years_of_experience?: number;
  current_position?: string;
  current_institution?: string;
  npi_number?: string; // National Provider Identifier for US
  dea_number?: string; // Drug Enforcement Administration number
  
  // Professional Verification
  verification_status?: 'verified' | 'pending' | 'unverified' | 'rejected';
  verification_documents?: {
    type: 'license' | 'degree' | 'certification' | 'id_proof';
    url: string;
    uploaded_at: string;
    verification_status: 'verified' | 'pending' | 'rejected';
  }[];
  
  // Professional Interests
  research_interests?: string[];
  clinical_interests?: string[];
  teaching_experience?: boolean;
  mentoring_availability?: boolean;
  
  // Institution-specific fields
  institution_type?: 'hospital' | 'clinic' | 'medical_college' | 'research_center' | 'pharmaceutical' | 'other';
  accreditations?: string[];
  departments?: string[];
  contact_info?: {
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  
  // Student-specific fields
  education_level?: 'undergraduate' | 'graduate' | 'postgraduate' | 'resident' | 'fellow';
  graduation_year?: number;
  
  // CME and Continuing Education
  cme_credits?: {
    total_credits: number;
    current_year_credits: number;
    last_updated: string;
  };
  
  // Privacy and Communication Preferences
  privacy_settings?: {
    show_license_number: boolean;
    show_contact_info: boolean;
    allow_research_collaboration: boolean;
    allow_case_consultation: boolean;
    allow_mentoring_requests: boolean;
  };
}

export interface Institution {
  id: string;
  created_at: string;
  updated_at: string;
  
  // Basic Information
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
  
  // Corporate Profile Fields (from requirements) - Optional for backward compatibility
  organization_email?: string | null;
  organization_head_name?: string | null;
  organization_head_contact?: string | null; // Not for public display
  employee_email?: string | null;
  employee_name?: string | null;
  employee_designation?: string | null;
  authorized_representative?: string | null;
  
  // Company Information - Optional for backward compatibility
  company_url?: string | null;
  year_of_establishment?: number | null;
  partnered_with?: string[] | null; // Links to 3D Association
  presence_in?: string[] | null; // List of countries
  focus?: 'pharmaceutical' | 'hospital' | 'research' | 'academics' | null;
  
  // Overview - Optional for backward compatibility
  overview?: string | null;
  
  // Projects - Optional for backward compatibility
  current_projects?: InstitutionProject[] | null;
  earlier_projects?: InstitutionProject[] | null;
  
  // Talent Requirements - Optional for backward compatibility
  talent_requirements?: TalentRequirement[] | null;
  
  // Promotions - Optional for backward compatibility
  promotions?: InstitutionPromotion[] | null;
  
  // Verification Status - Optional for backward compatibility
  verification_status?: 'pending' | 'verified' | 'rejected';
  email_verified?: boolean;
  confirmation_email_sent?: boolean;
}

export interface InstitutionProject {
  id: string;
  created_at: string;
  updated_at: string;
  institution_id: string;
  name: string;
  brief: string | null;
  video_links: string[] | null;
  analytical_view: string | null;
  marketing_strategies: string | null;
  branding: string | null;
  revenue_generation: string | null;
  year: number | null;
  is_current: boolean;
}

export interface TalentRequirement {
  id: string;
  created_at: string;
  updated_at: string;
  institution_id: string;
  title: string;
  description: string | null;
  experience_level: 'experienced' | 'freshers';
  requirements: string[] | null;
  location: string | null;
  salary_range: {
    min: number | null;
    max: number | null;
    currency: string | null;
  } | null;
  is_active: boolean;
}

export interface InstitutionPromotion {
  id: string;
  created_at: string;
  updated_at: string;
  institution_id: string;
  title: string;
  description: string | null;
  media_urls: string[] | null; // Images, banners, videos
  website_link: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
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
  updated_at: string;
  post_id: string;
  user_id: string;
  user_type: 'individual' | 'institution';
  reaction_type: 'like' | 'love' | 'support' | 'insightful' | 'celebrate' | 'curious';
}

export interface CommentLike {
  id: string;
  created_at: string;
  updated_at: string;
  comment_id: string;
  user_id: string;
  user_type: 'individual' | 'institution';
  reaction_type: 'like' | 'love' | 'support' | 'insightful' | 'celebrate' | 'curious';
}

export interface SavedPost {
  id: string;
  created_at: string;
  user_id: string;
  post_id: string;
}

export interface Connection {
  id: string;
  created_at: string;
  updated_at: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Follow {
  id: string;
  created_at: string;
  follower_id: string; // User who is following
  following_id: string; // User being followed (usually institution)
  follower_type: 'individual' | 'institution';
  following_type: 'individual' | 'institution';
}

export interface FollowWithProfile extends Follow {
  follower: Profile;
  following: Profile;
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

// Messaging interfaces for HIPAA-compliant communication
export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  title: string | null;
  conversation_type: 'direct' | 'group' | 'clinical';
  is_archived: boolean;
  is_pinned: boolean;
  last_message_at: string | null;
  participants_count: number;
}

export interface ConversationParticipant {
  id: string;
  created_at: string;
  conversation_id: string;
  user_id: string;
  user_type: 'individual' | 'institution';
  role: 'participant' | 'admin' | 'moderator';
  joined_at: string;
  left_at: string | null;
  is_muted: boolean;
  is_blocked: boolean;
  user?: Profile | Institution; // Added for join queries
}

export interface Message {
  id: string;
  created_at: string;
  updated_at: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'individual' | 'institution';
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system' | 'clinical_note';
  is_edited: boolean;
  is_deleted: boolean;
  reply_to_id: string | null;
  forwarded_from_id: string | null;
  read_by: string[]; // Array of user IDs who have read the message
  delivered_to: string[]; // Array of user IDs who have received the message
  encryption_level: 'standard' | 'hipaa' | 'encrypted';
  retention_policy: 'standard' | 'clinical' | 'permanent';
  audit_trail: {
    created_by: string;
    created_at: string;
    modified_by?: string;
    modified_at?: string;
    deleted_by?: string;
    deleted_at?: string;
  };
}

export interface MessageAttachment {
  id: string;
  created_at: string;
  message_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  encryption_key: string | null;
  is_encrypted: boolean;
  mime_type: string;
  thumbnail_url: string | null;
}

export interface MessageReaction {
  id: string;
  created_at: string;
  message_id: string;
  user_id: string;
  reaction_type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry' | 'clinical_important';
  emoji: string;
}

export interface ClinicalNote {
  id: string;
  created_at: string;
  updated_at: string;
  message_id: string;
  patient_id: string | null; // HIPAA: Patient identifier (encrypted)
  clinical_context: string;
  diagnosis_codes: string[];
  treatment_notes: string;
  medication_notes: string;
  follow_up_required: boolean;
  follow_up_date: string | null;
  urgency_level: 'routine' | 'urgent' | 'emergency';
  confidentiality_level: 'standard' | 'restricted' | 'highly_confidential';
  audit_trail: {
    created_by: string;
    created_at: string;
    modified_by?: string;
    modified_at?: string;
    accessed_by: string[];
    accessed_at: string[];
  };
}

export interface MessageWithSender extends Message {
  sender: Profile | Institution;
  attachments: MessageAttachment[];
  reactions: MessageReaction[];
  clinical_note?: ClinicalNote;
}

export interface ConversationWithParticipants extends Conversation {
  participants: ConversationParticipant[];
  last_message?: MessageWithSender;
  unread_count: number;
}

export interface MessagingSettings {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  notifications_enabled: boolean;
  sound_enabled: boolean;
  read_receipts_enabled: boolean;
  typing_indicators_enabled: boolean;
  auto_archive_days: number;
  message_retention_days: number;
  encryption_preference: 'standard' | 'hipaa' | 'encrypted';
  clinical_messaging_enabled: boolean;
  audit_logging_enabled: boolean;
  hipaa_compliance_enabled: boolean;
}

// Medical Specialty Groups
export interface SpecialtyGroup {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  specialty: string;
  description: string;
  icon_url?: string;
  member_count: number;
  is_private: boolean;
  requires_verification: boolean;
  allowed_credentials: string[]; // e.g., ['MD', 'DO', 'RN', 'PharmD']
  moderators: string[]; // Array of user IDs
  guidelines: string;
  tags: string[];
}

export interface SpecialtyGroupMember {
  id: string;
  created_at: string;
  group_id: string;
  user_id: string;
  role: 'member' | 'moderator' | 'admin';
  joined_at: string;
  verification_status: 'verified' | 'pending' | 'rejected';
}

// Case Discussion System
export interface CaseDiscussion {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  specialty_tags: string[];
  age_group?: 'pediatric' | 'adult' | 'geriatric';
  urgency_level: 'routine' | 'urgent' | 'emergent';
  case_type: 'diagnostic' | 'treatment' | 'management' | 'ethical' | 'research';
  author_id: string;
  group_id?: string; // If posted in a specialty group
  is_anonymous: boolean;
  patient_demographics: {
    age_range: string; // e.g., "25-30"
    gender?: 'male' | 'female' | 'other' | 'not_disclosed';
    relevant_history?: string;
  };
  media_attachments: {
    type: 'image' | 'document' | 'lab_result' | 'scan';
    url: string;
    description: string;
    is_anonymized: boolean;
  }[];
  responses_count: number;
  views_count: number;
  is_resolved: boolean;
  best_response_id?: string;
  hipaa_compliant: boolean;
  retention_policy: 'standard' | 'clinical' | 'research';
}

export interface CaseResponse {
  id: string;
  created_at: string;
  updated_at: string;
  case_id: string;
  author_id: string;
  content: string;
  response_type: 'opinion' | 'experience' | 'research' | 'question';
  confidence_level: 'low' | 'moderate' | 'high';
  cited_references: {
    title: string;
    authors: string[];
    journal?: string;
    year: number;
    doi?: string;
    pubmed_id?: string;
  }[];
  likes_count: number;
  is_marked_helpful: boolean;
  is_best_response: boolean;
}

// CME and Education System
export interface CMECourse {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  provider: string;
  accreditation_body: string;
  credit_hours: number;
  specialty_tags: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  course_type: 'video' | 'interactive' | 'reading' | 'simulation' | 'webinar';
  duration_minutes: number;
  price: number;
  currency: string;
  enrollment_count: number;
  rating_average: number;
  rating_count: number;
  is_free: boolean;
  expiry_date?: string;
  certificate_template_url?: string;
  learning_objectives: string[];
  prerequisites: string[];
}

export interface CMEEnrollment {
  id: string;
  created_at: string;
  course_id: string;
  user_id: string;
  enrollment_date: string;
  completion_date?: string;
  progress_percentage: number;
  final_score?: number;
  certificate_url?: string;
  certificate_issued_date?: string;
  status: 'enrolled' | 'in_progress' | 'completed' | 'expired' | 'failed';
}

// Medical Research and Publications
export interface ResearchCollaboration {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  lead_researcher_id: string;
  collaborators: string[];
  specialty_area: string;
  research_type: 'clinical_trial' | 'observational' | 'systematic_review' | 'meta_analysis' | 'case_series';
  status: 'planning' | 'recruiting' | 'active' | 'completed' | 'published';
  participant_criteria: string;
  estimated_duration: string;
  funding_source?: string;
  ethics_approval_number?: string;
  registration_number?: string; // Clinical trial registration
  contact_email: string;
  required_expertise: string[];
  location_requirements: string[];
}

// Tele-Mentoring System
export interface MentoringSession {
  id: string;
  created_at: string;
  updated_at: string;
  mentor_id: string;
  mentee_id: string;
  title: string;
  description: string;
  specialty_focus: string;
  session_type: 'one_time' | 'ongoing' | 'group';
  duration_minutes: number;
  scheduled_date?: string;
  status: 'requested' | 'accepted' | 'scheduled' | 'completed' | 'cancelled';
  meeting_link?: string;
  notes?: string;
  rating?: number;
  feedback?: string;
  skills_covered: string[];
  is_recorded: boolean;
  recording_url?: string;
}

 